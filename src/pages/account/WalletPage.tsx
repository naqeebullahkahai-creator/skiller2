import CustomerWalletCard from "@/components/account/CustomerWalletCard";
import DepositFundsSection from "@/components/wallet/DepositFundsSection";
import { formatPKR } from "@/hooks/useProducts";

const WalletPage = () => {
  return (
    <div className="space-y-6">
      <CustomerWalletCard />
      <DepositFundsSection requesterType="customer" formatCurrency={formatPKR} />
    </div>
  );
};

export default WalletPage;
