import { useEffect } from "react";

interface PaymentProps {
  setBookingState: React.Dispatch<React.SetStateAction<boolean>>;
}

const Payment: React.FC<PaymentProps> = ({ setBookingState }) => {
  useEffect(() => {
    setBookingState(true);
  }, []);
  return (
    <>
      <p>환불진행</p>
    </>
  );
};
export default Payment;
