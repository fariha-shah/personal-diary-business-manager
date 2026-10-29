import { useState, useEffect, useCallback } from 'react';
import { performOperation, formatNumber } from '../utils/operations';
import { auth, db } from '../../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';

const MAX_DISPLAY_DIGITS = 12;
const MAX_HISTORY = 50;

export function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const historyRef = collection(db, 'users', uid, 'calculatorHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(MAX_HISTORY));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setHistory(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          }))
        );
      },
      (err) => console.error('Failed to load calculator history:', err)
    );

    return unsubscribe;
  }, []);

  const inputDigit = useCallback(
    (digit) => {
      setDisplay((prev) => {
        if (overwrite) return digit;
        if (prev === '0') return digit;
        if (prev.replace('-', '').replace('.', '').length >= MAX_DISPLAY_DIGITS) {
          return prev;
        }
        return prev + digit;
      });
      setOverwrite(false);
    },
    [overwrite]
  );

  const inputDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (overwrite) return '0.';
      if (prev.includes('.')) return prev;
      return `${prev}.`;
    });
    setOverwrite(false);
  }, [overwrite]);

  const toggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === '0') return prev;
      return prev.startsWith('-') ? prev.slice(1) : `-${prev}`;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setStoredValue(null);
    setOperator(null);
    setOverwrite(true);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    setOverwrite(true);
  }, []);

  const backspace = useCallback(() => {
    if (overwrite) return;
    setDisplay((prev) => {
      const next = prev.slice(0, -1);
      return next === '' || next === '-' ? '0' : next;
    });
  }, [overwrite]);

  const inputOperator = useCallback(
    (nextOp) => {
      const current = parseFloat(display);

      if (operator && !overwrite) {
        const result = performOperation(storedValue, operator, current);
        const formatted = formatNumber(result);

        setDisplay(formatted);
        setStoredValue(parseFloat(formatted));
        setExpression(`${formatted} ${nextOp}`);
      } else {
        setStoredValue(current);
        setExpression(`${formatNumber(current)} ${nextOp}`);
      }

      setOperator(nextOp);
      setOverwrite(true);
    },
    [display, operator, overwrite, storedValue]
  );

  const inputPercent = useCallback(() => {
    const current = parseFloat(display);
    const result =
      operator && storedValue !== null
        ? (storedValue * current) / 100
        : current / 100;

    setDisplay(formatNumber(result));
    setOverwrite(true);
  }, [display, operator, storedValue]);

  const calculate = useCallback(() => {
    if (operator === null || storedValue === null) return;

    const current = parseFloat(display);
    const result = performOperation(storedValue, operator, current);
    const formatted = formatNumber(result);
    const fullExpression = `${expression} ${formatNumber(current)}`;

    setDisplay(formatted);
    setExpression('');
    setStoredValue(null);
    setOperator(null);
    setOverwrite(true);

    if (formatted !== 'Error') {
      const uid = auth.currentUser?.uid;

      const entry = {
        title: title.trim() || 'Untitled Calculation',
        description: description.trim() || 'Calculation without description',
        expression: fullExpression,
        result: formatted,
        timestamp: new Date().toISOString(),
      };

      addDoc(collection(db, 'users', uid, 'calculatorHistory'), entry).catch(
        (err) => console.error('Failed to save calculation:', err)
      );
    }
  }, [operator, storedValue, display, expression, title, description]);

  const clearHistory = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const historyRef = collection(db, 'users', uid, 'calculatorHistory');
      const snap = await getDocs(historyRef);

      const batch = writeBatch(db);
      snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
    } catch (err) {
      console.error('Failed to clear calculator history:', err);
    }
  }, []);

  const reuseHistoryResult = useCallback((value) => {
    setDisplay(value);
    setExpression('');
    setStoredValue(null);
    setOperator(null);
    setOverwrite(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
          e.preventDefault();
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+' || e.key === '-') {
        inputOperator(e.key);
      } else if (e.key === '*') {
        inputOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        inputOperator('÷');
      } else if (e.key === '%') {
        inputPercent();
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, inputOperator, inputPercent, calculate, backspace, clearAll]);

  return {
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
  };
}