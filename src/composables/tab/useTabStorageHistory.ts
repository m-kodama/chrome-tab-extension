import { TabStorage } from '@/repositories/TabRepository';

export default function useTabStorageHistory(options?: {
  maxHistoryLength?: number;
}): {
  undo: () => TabStorage | null;
  redo: () => TabStorage | null;
  updateHistory: (recent: TabStorage) => void;
} {
  let index = -1;
  const max = options?.maxHistoryLength ?? 30;
  const history: TabStorage[] = [];

  const undo = (): TabStorage | null => {
    if (index === -1) {
      return null;
    }
    return history[--index];
  };

  const redo = (): TabStorage | null => {
    if (index === history.length - 1) {
      return null;
    }
    return history[++index];
  };

  const updateHistory = (recent: TabStorage) => {
    // 現在のインデックスより後の要素を削除
    history.splice(index + 1);
    // 末尾に要素を追加しインデックスを更新
    history.push(recent);
    index++;
    // 履歴の最大を超えた場合は先頭を削除しインデックスを調整
    if (history.length > max) {
      history.shift();
      index--;
    }
  };

  return {
    undo,
    redo,
    updateHistory,
  };
}
