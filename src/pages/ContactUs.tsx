import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  Loader2, 
  MessageCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Skeleton } from "@/components/ui/skeleton";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone number is too long").optional(),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { settings, isLoading, getContactInfo } = useSiteSettings();

  const contactInfo = getContactInfo();
  const phoneInfo = contactInfo.find(c => c.setting_key === 'contact_phone');
  const emailInfo = contactInfo.find(c => c.setting_key === 'contact_email');
  const addressInfo = contactInfo.find(c => c.setting_key === 'contact_address');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          adminEmail: emailInfo?.setting_value || 'support@fanzon.pk',
        },
      });

      if (error) throw error;

      if (response?.success) {
        setIsSuccess(true);
        toast.success("Message sent successfully! We'll get back to you soon.");
        form.reset();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        throw new Error(response?.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - FANZON Pakistan</title>
        <meta name="description" content="Get in touch with FANZON Pakistan. We're here to help with your questions, orders, and feedback." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Contact Information Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Phone Card */}
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ) : phoneInfo?.is_enabled ? (
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                          <a 
                            href={`tel:${phoneInfo.setting_value}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {phoneInfo.setting_value}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 opacity-50">
                        <div className="p-3 rounded-full bg-muted">
                          <Phone className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-muted-foreground">Phone</h3>
                          <p className="text-sm text-muted-foreground">Not available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Email Card */}
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ) : emailInfo?.is_enabled ? (
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Email</h3>
                          <a 
                            href={`mailto:${emailInfo.setting_value}`}
                            className="text-muted-foreground hover:text-primary transition-colors break-all"
                          >
                            {emailInfo.setting_value}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 opacity-50">
                        <div className="p-3 rounded-full bg-muted">
                          <Mail className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-muted-foreground">Email</h3>
                          <p className="text-sm text-muted-foreground">Not available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Address Card */}
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ) : addressInfo?.is_enabled ? (
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Address</h3>
                          <p className="text-muted-foreground">
                            {addressInfo.setting_value}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 opacity-50">
                        <div className="p-3 rounded-full bg-muted">
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-muted-foreground">Address</h3>
                          <p className="text-sm text-muted-foreground">Not available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Business Hours Card */}
                <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Monday - Saturday: 9:00 AM - 9:00 PM</p>
                          <p>Sunday: 10:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Send us a Message</CardTitle>
                        <CardDescription>
                          Fill out the form below and we'll get back to you within 24 hours.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isSuccess ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground">
                          Thank you for reaching out. We'll respond to your inquiry soon.
                        </p>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Your name" 
                                      {...field} 
                                      className="h-11"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="your@email.com" 
                                      {...field}
                                      className="h-11"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="tel" 
                                      placeholder="+92 300 1234567" 
                                      {...field}
                                      className="h-11"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="How can we help?" 
                                      {...field}
                                      className="h-11"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us more about your inquiry..."
                                    className="min-h-[150px] resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </>
  );
};

export default ContactUs;
