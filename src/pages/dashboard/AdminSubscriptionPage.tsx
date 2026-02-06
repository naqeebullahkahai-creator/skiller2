import AdminSubscriptionSettings from "@/components/dashboard/AdminSubscriptionSettings";

const AdminSubscriptionPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage platform subscription fees and per-seller overrides
        </p>
      </div>
      
      <AdminSubscriptionSettings />
    </div>
  );
};

export default AdminSubscriptionPage;
