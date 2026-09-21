package in.lesuccess.portal.shared.util;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.function.ToIntFunction;

/**
 * Universal utility for managing ordered entity collections.
 * Enforces:
 * 1. Automatic next order = highest + 1.
 * 2. Guaranteed 1..N gapless, duplicate-free sequence.
 * 3. Atomic position shifting when an item is moved to a target order.
 */
public final class OrderRebalanceUtil {

    private OrderRebalanceUtil() {}

    /**
     * Calculates the next display order (current highest + 1).
     * If collection is empty, returns 1.
     */
    public static <T> int getNextOrder(List<T> items, ToIntFunction<T> orderGetter) {
        if (items == null || items.isEmpty()) {
            return 1;
        }
        return items.stream()
                .mapToInt(orderGetter)
                .max()
                .orElse(0) + 1;
    }

    /**
     * Shifts an existing item to a target position and re-indexes all affected items
     * to a gapless 1..N sequence without duplicates.
     *
     * @param items Existing collection of items (active/non-deleted).
     * @param targetId The ID of the item being moved.
     * @param targetOrder 1-based desired order position.
     * @param idGetter Function to extract item ID.
     * @param orderGetter Function to read item order.
     * @param orderSetter Consumer to update item order.
     * @return List of all items whose orders were modified and need saving.
     */
    public static <T, ID> List<T> reorder(
            List<T> items,
            ID targetId,
            int targetOrder,
            Function<T, ID> idGetter,
            ToIntFunction<T> orderGetter,
            BiConsumer<T, Integer> orderSetter) {

        if (items == null || items.isEmpty()) {
            return List.of();
        }

        // Sort copy by current order ASC
        List<T> sorted = new ArrayList<>(items);
        sorted.sort(Comparator.comparingInt(orderGetter));

        // Find target item
        T targetItem = null;
        int currentIndex = -1;
        for (int i = 0; i < sorted.size(); i++) {
            if (Objects.equals(idGetter.apply(sorted.get(i)), targetId)) {
                targetItem = sorted.get(i);
                currentIndex = i;
                break;
            }
        }

        if (targetItem == null) {
            return List.of();
        }

        // Remove from current position
        sorted.remove(currentIndex);

        // Calculate clamped insertion index (0-based)
        int desiredIndex = targetOrder - 1;
        int clampedIndex = Math.max(0, Math.min(desiredIndex, sorted.size()));

        // Insert at target position
        sorted.add(clampedIndex, targetItem);

        // Re-index all elements sequentially from 1 to N
        List<T> modified = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            T item = sorted.get(i);
            int newSeq = i + 1;
            if (orderGetter.applyAsInt(item) != newSeq) {
                orderSetter.accept(item, newSeq);
                modified.add(item);
            }
        }

        return modified;
    }

    /**
     * Re-indexes a list of items sequentially from 1 to N to close gaps (e.g. after deletion).
     */
    public static <T> List<T> rebalance(
            List<T> items,
            ToIntFunction<T> orderGetter,
            BiConsumer<T, Integer> orderSetter) {

        if (items == null || items.isEmpty()) {
            return List.of();
        }

        List<T> sorted = new ArrayList<>(items);
        sorted.sort(Comparator.comparingInt(orderGetter));

        List<T> modified = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            T item = sorted.get(i);
            int newSeq = i + 1;
            if (orderGetter.applyAsInt(item) != newSeq) {
                orderSetter.accept(item, newSeq);
                modified.add(item);
            }
        }
        return modified;
    }
}
