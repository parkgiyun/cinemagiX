import { useEffect } from "react";

interface PaymentProps {
  setMemoBookingState: (id: boolean) => void;
}

const Payment: React.FC<PaymentProps> = ({ setMemoBookingState }) => {
  useEffect(() => {
    setMemoBookingState(true);
  }, []);
  return (
    <>
      <p>환불진행</p>
    </>
  );
};
export default Payment;