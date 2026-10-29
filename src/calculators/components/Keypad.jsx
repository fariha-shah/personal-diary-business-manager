const base =
  'h-12 sm:h-14 rounded-xl text-base sm:text-lg font-medium transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const numBtn = `${base} bg-gray-100 text-gray-900 hover:bg-gray-200`;

const opBtn = `${base} bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white`;

const funcBtn = `${base} bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300`;

const equalsBtn = `${base} bg-blue-600 text-white hover:bg-blue-700 shadow-sm`;

export default function Keypad({
  onDigit,
  onDecimal,
  onOperator,
  onPercent,
  onEquals,
  onClearAll,
  onClearEntry,
  onToggleSign,
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <button className={funcBtn} onClick={onClearAll}>
        AC
      </button>

      <button className={funcBtn} onClick={onClearEntry}>
        C
      </button>

      <button className={funcBtn} onClick={onPercent}>
        %
      </button>

      <button className={opBtn} onClick={() => onOperator('÷')}>
        ÷
      </button>

      <button className={numBtn} onClick={() => onDigit('7')}>
        7
      </button>

      <button className={numBtn} onClick={() => onDigit('8')}>
        8
      </button>

      <button className={numBtn} onClick={() => onDigit('9')}>
        9
      </button>

      <button className={opBtn} onClick={() => onOperator('×')}>
        ×
      </button>

      <button className={numBtn} onClick={() => onDigit('4')}>
        4
      </button>

      <button className={numBtn} onClick={() => onDigit('5')}>
        5
      </button>

      <button className={numBtn} onClick={() => onDigit('6')}>
        6
      </button>

      <button className={opBtn} onClick={() => onOperator('-')}>
        −
      </button>

      <button className={numBtn} onClick={() => onDigit('1')}>
        1
      </button>

      <button className={numBtn} onClick={() => onDigit('2')}>
        2
      </button>

      <button className={numBtn} onClick={() => onDigit('3')}>
        3
      </button>

      <button className={opBtn} onClick={() => onOperator('+')}>
        +
      </button>

      <button className={funcBtn} onClick={onToggleSign}>
        +/−
      </button>

      <button className={numBtn} onClick={() => onDigit('0')}>
        0
      </button>

      <button className={numBtn} onClick={onDecimal}>
        .
      </button>

      <button className={equalsBtn} onClick={onEquals}>
        =
      </button>
    </div>
  );
}
