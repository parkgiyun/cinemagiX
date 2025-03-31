import { motion } from "framer-motion";
export const BufferingAni = ({ className }: { className: string }) => {
  return (
    <div className={className}>
      <motion.div
        key="loading"
        initial={{ opacity: 0.5, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="flex justify-center items-center h-40"
      >
        <div
          className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}
        ></div>
      </motion.div>
    </div>
  );
};

export const ProgressBarAni = ({
  name,
  width,
  className,
}: {
  name: string;
  width: number;
  className: string;
}) => {
  return (
    <div className={className}>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700 dark:text-white">{name}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-white">{width}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <motion.div
          className="bg-gray-900 h-2.5 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export const scrollAni = (ref: React.RefObject<HTMLDivElement | null>) => {
  setTimeout(() => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, 100);
};
