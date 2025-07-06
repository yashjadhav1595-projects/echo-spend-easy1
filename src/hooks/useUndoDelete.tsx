
import React, { useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/Transaction';

export const useUndoDelete = () => {
  const { toast } = useToast();
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deletedTransactionRef = useRef<Transaction | null>(null);
  const onRestoreRef = useRef<(() => void) | null>(null);

  const showUndoToast = useCallback((
    transaction: Transaction, 
    onRestore: () => void
  ) => {
    // Store references for undo functionality
    deletedTransactionRef.current = transaction;
    onRestoreRef.current = onRestore;

    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    const { dismiss } = toast({
      title: "Transaction deleted",
      description: "Click undo to restore the transaction",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onRestore();
            dismiss();
            if (undoTimeoutRef.current) {
              clearTimeout(undoTimeoutRef.current);
            }
          }}
        >
          Undo
        </Button>
      ),
    });

    // Auto-dismiss after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      dismiss();
      deletedTransactionRef.current = null;
      onRestoreRef.current = null;
    }, 5000);
  }, [toast]);

  return { showUndoToast };
};
