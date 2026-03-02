import { useState } from "react";
import { 
  Shield, 
  Plus, 
  Search, 
  Settings2, 
  Trash2, 
  Check,
  X,
  Eye,
  Edit,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  useStaffRoles, 
  useRolePermissions, 
  useStaffRoleAssignments,
  useRoleMutations,
  PermissionFeature,
  RolePermission,
  StaffRole,
} from "@/hooks/useRoleManagement";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const FEATURES: { key: PermissionFeature; label: string; description: string }[] = [
  { key: 'banners', label: 'Banners', description: 'Hero banners and promotional content' },
  { key: 'products', label: 'Products', description: 'Product catalog management' },
  { key: 'orders', label: 'Orders', description: 'Order management and processing' },
  { key: 'payouts', label: 'Payouts', description: 'Seller payout management' },
  { key: 'flash_sales', label: 'Flash Sales', description: 'Flash sale campaigns' },
  { key: 'users', label: 'Users', description: 'User and seller management' },
  { key: 'categories', label: 'Categories', description: 'Category management' },
  { key: 'reviews', label: 'Reviews', description: 'Product review moderation' },
  { key: 'returns', label: 'Returns', description: 'Return request handling' },
  { key: 'analytics', label: 'Analytics', description: 'Platform analytics and reports' },
  { key: 'settings', label: 'Settings', description: 'Platform settings' },
  { key: 'vouchers', label: 'Vouchers', description: 'Voucher and discount management' },
];

const AdminRolesPage = () => {
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [changeRoleUserId, setChangeRoleUserId] = useState<string | null>(null);
  const [changeRoleTarget, setChangeRoleTarget] = useState<string>("");
  const [changeRoleSearch, setChangeRoleSearch] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleIdForAssignment, setSelectedRoleIdForAssignment] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Record<PermissionFeature, {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>>({} as any);
  
  const { data: roles = [], isLoading: rolesLoading } = useStaffRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = useRolePermissions(selectedRole?.id || null);
  const { data: assignments = [] } = useStaffRoleAssignments();
  const { users, isLoading: usersLoading } = useAdminUsers(userSearchQuery);
  const { users: changeRoleUsers } = useAdminUsers(changeRoleSearch);
  const { createRole, updateRolePermissions, deleteRole, assignRole, removeRole } = useRoleMutations();
  const qc = useQueryClient();
  
  // Initialize editing permissions when a role is selected
  const handleSelectRole = (role: StaffRole) => {
    setSelectedRole(role);
    
    // Initialize with empty permissions
    const initial: any = {};
    FEATURES.forEach(f => {
      initial[f.key] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
    });
    
    // Populate from existing permissions (if loaded)
    permissions.forEach(p => {
      if (initial[p.feature]) {
        initial[p.feature] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        };
      }
    });
    
    setEditingPermissions(initial);
  };
  
  // Update local editing state when permissions load
  const updatePermissionsFromData = () => {
    if (permissions.length > 0 && selectedRole) {
      const updated: any = { ...editingPermissions };
      permissions.forEach(p => {
        updated[p.feature] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        };
      });
      setEditingPermissions(updated);
    }
  };
  
  // Effect to update when permissions load
  if (permissions.length > 0 && selectedRole && Object.keys(editingPermissions).length === 0) {
    updatePermissionsFromData();
  }
  
  const handleTogglePermission = (
    feature: PermissionFeature, 
    action: 'can_view' | 'can_create' | 'can_edit' | 'can_delete'
  ) => {
    setEditingPermissions(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [action]: !prev[feature]?.[action],
      },
    }));
  };
  
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    const permissionsToSave = Object.entries(editingPermissions)
      .filter(([_, perms]) => perms.can_view || perms.can_create || perms.can_edit || perms.can_delete)
      .map(([feature, perms]) => ({
        feature: feature as PermissionFeature,
        ...perms,
      }));
    
    await updateRolePermissions.mutateAsync({
      roleId: selectedRole.id,
      permissions: permissionsToSave,
    });
  };
  
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    
    await createRole.mutateAsync({
      name: newRoleName,
      description: newRoleDescription,
    });
    
    setNewRoleName("");
    setNewRoleDescription("");
    setShowCreateRole(false);
  };
  
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleIdForAssignment) {
      toast.error("Please select a user and role");
      return;
    }
    
    await assignRole.mutateAsync({
      userId: selectedUserId,
      roleId: selectedRoleIdForAssignment,
    });
    
    setSelectedUserId(null);
    setSelectedRoleIdForAssignment(null);
    setShowAssignRole(false);
  };
  
  const handleChangeUserRole = async () => {
    if (!changeRoleUserId || !changeRoleTarget) {
      toast.error("Select a user and a target role");
      return;
    }
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: changeRoleTarget as any })
        .eq("user_id", changeRoleUserId);
      if (error) throw error;
      toast.success("User primary role changed successfully!");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setShowChangeRole(false);
      setChangeRoleUserId(null);
      setChangeRoleTarget("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change role");
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">Manage staff roles and their access permissions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowChangeRole(true)} variant="outline" size="sm">
            <Plus size={16} className="mr-2" />
            Change User Role
          </Button>
          <Button onClick={() => setShowAssignRole(true)} variant="outline" size="sm">
            <Plus size={16} className="mr-2" />
            Assign Staff Role
          </Button>
          <Button onClick={() => setShowCreateRole(true)} size="sm">
            <Plus size={16} className="mr-2" />
            Create Role
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Available Roles</CardTitle>
                <CardDescription>Select a role to manage its permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {rolesLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`w-full p-3 rounded-lg text-left transition-colors border ${
                        selectedRole?.id === role.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {role.description}
                          </p>
                        </div>
                        {role.is_system_role && (
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
            
            {/* Permissions Editor */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedRole ? `${selectedRole.name} Permissions` : 'Select a Role'}
                    </CardTitle>
                    <CardDescription>
                      {selectedRole 
                        ? 'Configure what this role can access and modify'
                        : 'Click on a role to manage its permissions'
                      }
                    </CardDescription>
                  </div>
                  {selectedRole && (
                    <Button 
                      onClick={handleSavePermissions}
                      disabled={updateRolePermissions.isPending}
                    >
                      {updateRolePermissions.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedRole ? (
                  permissionsLoading ? (
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="grid grid-cols-5 gap-4 pb-2 border-b text-sm font-medium text-muted-foreground">
                        <div>Feature</div>
                        <div className="text-center">View</div>
                        <div className="text-center">Create</div>
                        <div className="text-center">Edit</div>
                        <div className="text-center">Delete</div>
                      </div>
                      
                      {/* Permission Rows */}
                      {FEATURES.map(feature => (
                        <div 
                          key={feature.key} 
                          className="grid grid-cols-5 gap-4 items-center py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2"
                        >
                          <div>
                            <p className="font-medium text-sm">{feature.label}</p>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={editingPermissions[feature.key]?.can_view || false}
                              onCheckedChange={() => handleTogglePermission(feature.key, 'can_view')}
                              disabled={selectedRole.name === 'Super Admin'}
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={editingPermissions[feature.key]?.can_create || false}
                              onCheckedChange={() => handleTogglePermission(feature.key, 'can_create')}
                              disabled={selectedRole.name === 'Super Admin'}
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={editingPermissions[feature.key]?.can_edit || false}
                              onCheckedChange={() => handleTogglePermission(feature.key, 'can_edit')}
                              disabled={selectedRole.name === 'Super Admin'}
                            />
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={editingPermissions[feature.key]?.can_delete || false}
                              onCheckedChange={() => handleTogglePermission(feature.key, 'can_delete')}
                              disabled={selectedRole.name === 'Super Admin'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a role from the list to manage its permissions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Assignments</CardTitle>
              <CardDescription>View and manage staff role assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No role assignments yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map(assignment => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <span className="font-medium">{assignment.user_id.slice(0, 8)}...</span>
                        </TableCell>
                        <TableCell>
                          <Badge>{assignment.role?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(assignment.assigned_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeRole.mutate(assignment.user_id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., Content Manager"
              />
            </div>
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Describe what this role is for..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRole(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={createRole.isPending}>
              {createRole.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Role Dialog */}
      <Dialog open={showAssignRole} onOpenChange={setShowAssignRole}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search User</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* User List */}
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
              {usersLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : users.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No users found</p>
              ) : (
                users.slice(0, 10).map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full p-2 rounded-lg flex items-center gap-3 text-left transition-colors ${
                      selectedUserId === user.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {user.avatar_url && (
                        <AvatarImage src={user.avatar_url} className="object-cover aspect-square" />
                      )}
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div>
              <Label>Select Role</Label>
              <Select 
                value={selectedRoleIdForAssignment || ""} 
                onValueChange={setSelectedRoleIdForAssignment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignRole(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRole} 
              disabled={assignRole.isPending || !selectedUserId || !selectedRoleIdForAssignment}
            >
              {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change User Primary Role Dialog */}
      <Dialog open={showChangeRole} onOpenChange={setShowChangeRole}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Change User Primary Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search User</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={changeRoleSearch}
                  onChange={(e) => setChangeRoleSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
              {changeRoleUsers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No users found</p>
              ) : (
                changeRoleUsers.slice(0, 10).map(user => (
                  <button
                    key={user.id}
                    onClick={() => setChangeRoleUserId(user.id)}
                    className={`w-full p-2 rounded-lg flex items-center gap-3 text-left transition-colors ${
                      changeRoleUserId === user.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} className="object-cover aspect-square" />}
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{user.role}</Badge>
                  </button>
                ))
              )}
            </div>
            
            <div>
              <Label>New Primary Role</Label>
              <Select value={changeRoleTarget} onValueChange={setChangeRoleTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="support_agent">Support Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {changeRoleTarget && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> Warning
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Changing a user's role will <strong>remove their previous role access</strong>. 
                  {changeRoleTarget === "support_agent" && " They will only be able to access the Support Agent dashboard and will lose all customer/seller access."}
                  {changeRoleTarget === "admin" && " They will gain full admin access to the platform."}
                  {changeRoleTarget === "seller" && " They will only be able to access the Seller dashboard."}
                  {changeRoleTarget === "customer" && " They will only be able to access customer pages."}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeRole(false)}>Cancel</Button>
            <Button onClick={handleChangeUserRole} disabled={!changeRoleUserId || !changeRoleTarget} variant="destructive">
              Confirm Role Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRolesPage;
