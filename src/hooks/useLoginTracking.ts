import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  
  // Device type
  let deviceType = "desktop";
  if (/Mobi|Android/i.test(ua)) deviceType = "mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceType = "tablet";
  
  // Browser
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  
  // OS
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";
  
  // Device name
  let deviceName = "";
  const match = ua.match(/\(([^)]+)\)/);
  if (match) deviceName = match[1].split(";")[0].trim();
  
  return { deviceType, browser, os, deviceName };
};

const fetchIPInfo = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ip: null, country: null, city: null };
    const data = await res.json();
    return { ip: data.ip || null, country: data.country_name || null, city: data.city || null };
  } catch {
    return { ip: null, country: null, city: null };
  }
};

export const useLoginTracking = () => {
  const { user, role, isAuthenticated } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !role || trackedRef.current) return;
    trackedRef.current = true;

    const trackLogin = async () => {
      const device = getDeviceInfo();
      const ipInfo = await fetchIPInfo();
      
      // Check for suspicious activity
      let isSuspicious = false;
      let suspiciousReason = "";
      
      // Check recent failed attempts
      const { data: recentFailed } = await supabase
        .from("login_sessions")
        .select("id")
        .eq("user_email", user.email || "")
        .eq("login_status", "failed")
        .gte("login_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());
      
      if (recentFailed && recentFailed.length >= 5) {
        isSuspicious = true;
        suspiciousReason = `${recentFailed.length} failed attempts in 30 minutes`;
      }
      
      // Check for new device
      let isNewDevice = false;
      const { data: prevSessions } = await supabase
        .from("login_sessions")
        .select("browser_name, os_name, device_type")
        .eq("user_id", user.id)
        .eq("login_status", "success")
        .limit(10);
      
      if (prevSessions && prevSessions.length > 0) {
        const knownDevices = prevSessions.map(s => `${s.browser_name}-${s.os_name}-${s.device_type}`);
        const currentDevice = `${device.browser}-${device.os}-${device.deviceType}`;
        if (!knownDevices.includes(currentDevice)) {
          isNewDevice = true;
        }
      }
      
      // Check multiple IPs in short time
      if (ipInfo.ip) {
        const { data: recentLogins } = await supabase
          .from("login_sessions")
          .select("ip_address, country")
          .eq("user_id", user.id)
          .eq("login_status", "success")
          .gte("login_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .neq("ip_address", ipInfo.ip);
        
        if (recentLogins && recentLogins.length >= 2) {
          isSuspicious = true;
          suspiciousReason = (suspiciousReason ? suspiciousReason + "; " : "") + "Multiple IPs in 1 hour";
        }
        
        // Different country
        if (recentLogins && recentLogins.some(s => s.country && ipInfo.country && s.country !== ipInfo.country)) {
          isSuspicious = true;
          suspiciousReason = (suspiciousReason ? suspiciousReason + "; " : "") + "Different country login";
        }
      }
      
      const { data } = await supabase
        .from("login_sessions")
        .insert({
          user_id: user.id,
          user_email: user.email || "",
          user_role: role,
          ip_address: ipInfo.ip,
          country: ipInfo.country,
          city: ipInfo.city,
          device_type: device.deviceType,
          device_name: device.deviceName,
          browser_name: device.browser,
          os_name: device.os,
          login_status: "success",
          is_suspicious: isSuspicious,
          suspicious_reason: suspiciousReason || null,
          is_new_device: isNewDevice,
        })
        .select("id")
        .single();
      
      if (data) {
        sessionIdRef.current = data.id;
      }
    };

    trackLogin();

    // Track logout
    return () => {
      if (sessionIdRef.current) {
        const sid = sessionIdRef.current;
        supabase
          .from("login_sessions")
          .update({
            logout_at: new Date().toISOString(),
          })
          .eq("id", sid)
          .then(() => {});
      }
    };
  }, [isAuthenticated, user, role]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      trackedRef.current = false;
      sessionIdRef.current = null;
    }
  }, [isAuthenticated]);
};
