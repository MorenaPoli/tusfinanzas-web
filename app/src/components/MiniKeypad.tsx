interface MiniKeypadProps {
  value: string;
  onChange: (val: string) => void;
}

export default function MiniKeypad({ value, onChange }: MiniKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  const handleKeyClick = (key: string) => {
    if (key === 'C') {
      onChange('');
    } else if (key === '⌫') {
      onChange(value.length > 0 ? value.slice(0, -1) : '');
    } else {
      // Prevent double decimals or leading zeros
      if (key === '0' && value === '0') return;
      onChange(value + key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-1 w-full max-w-[200px] mx-auto pt-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => handleKeyClick(k)}
          className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.05] text-xs font-bold hover:bg-white/10 active:scale-95 transition-all text-white/80 flex items-center justify-center"
        >
          {k}
        </button>
      ))}
    </div>
  );
}
