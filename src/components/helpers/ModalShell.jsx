const ModalShell = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-15 flex items-center justify-center p-4 touch-none">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur"
        onClick={onClose}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
export default ModalShell;
