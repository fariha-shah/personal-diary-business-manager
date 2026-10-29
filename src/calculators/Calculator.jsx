import { FiFileText, FiGrid } from 'react-icons/fi';

import Card from '../components/common/Card';
import Display from './components/Display';
import Keypad from './components/Keypad';
import HistoryPanel from './components/HistoryPanel';
import { useCalculator } from './hooks/useCalculator';

export default function Calculator() {
  const {
    display,
    expression,
    history,

    title,
    description,
    setTitle,
    setDescription,

    inputDigit,
    inputDecimal,
    inputOperator,
    inputPercent,
    calculate,
    clearAll,
    clearEntry,
    toggleSign,
    clearHistory,
    reuseHistoryResult,
  } = useCalculator();

  return (
    // -m-6 cancels MainLayout's p-6 padding and px-8 py-6 re-adds it here —
    // same trick Notes.jsx and PersonalExpenses.jsx use so this page gets
    // its own full-bleed light background instead of the dark shell
    // showing through.
    <div className="-m-3 sm:-m-5 md:-m-6 min-h-[calc(100vh-4rem)] bg-gray-50 px-3 sm:px-6 md:px-8 py-4 sm:py-6 animate-[fadeIn_0.35s_ease-out]">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FiGrid className="text-blue-600" size={20} />
          </div>

          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">Calculator</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
        {/* Left Side */}
        <div className="space-y-4">
          {/* Calculation Information */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FiFileText className="text-blue-600" size={17} />
              </div>

              <div>
                <h2 className="text-gray-900 text-sm font-semibold">
                  Calculation Details
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="calculation-title"
                  className="block text-gray-500 text-xs font-medium mb-1.5"
                >
                  Calculation Title
                </label>

                <input
                  id="calculation-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Grocery"
                  className="w-full h-10 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="calculation-description"
                  className="block text-gray-500 text-xs font-medium mb-1.5"
                >
                  Description
                </label>

                <input
                  id="calculation-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grocery expense calculation"
                  className="w-full h-10 px-3 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </Card>

          {/* Calculator */}
          <Card className="p-4 sm:p-5 max-w-xl">
            <Display expression={expression} value={display} />

            <Keypad
              onDigit={inputDigit}
              onDecimal={inputDecimal}
              onOperator={inputOperator}
              onPercent={inputPercent}
              onEquals={calculate}
              onClearAll={clearAll}
              onClearEntry={clearEntry}
              onToggleSign={toggleSign}
            />
          </Card>
        </div>

        {/* History */}
        <Card
          padding="p-0"
          className="w-full h-[430px] xl:h-auto xl:min-h-[620px] flex flex-col overflow-hidden"
        >
          <HistoryPanel
            history={history}
            onSelect={reuseHistoryResult}
            onClear={clearHistory}
          />
        </Card>
      </div>
    </div>
  );
}
