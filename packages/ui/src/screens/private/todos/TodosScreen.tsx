"use client";

/**
 * TodosScreen - Todo list management (private, authenticated)
 *
 * Full CRUD for todos. Navigation is handled by parent layout.
 */

import type { Session } from "@app/auth";
import { Plus, Check, Trash2, Calendar, Circle } from "lucide-react-native";
import React, { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useTodos } from "../../../hooks/queries";
import { useCreateTodo, useToggleTodo, useDeleteTodo } from "../../../hooks/mutations";
import { useAccessibilityAnnounce } from "../../../hooks/useAccessibilityAnnounce";

export interface TodosScreenProps {
  session: Session | null;
}

export const TodosScreen: React.FC<TodosScreenProps> = ({ session }) => {
  const { t } = useTranslation(["common", "todos"]);
  const { width: screenWidth } = useWindowDimensions();
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const announce = useAccessibilityAnnounce();

  // Accessibility IDs
  const baseId = useId();
  const newTodoInputId = `new-todo-${baseId}`;

  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = isSmallScreen ? 16 : 24;

  // Queries
  const { data, isLoading, isError, error } = useTodos(session);

  // Mutations
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) return;
    try {
      await createTodo.mutateAsync({ title: newTodoTitle.trim() });
      setNewTodoTitle("");
      announce(t("todos:created"));
    } catch (err) {
      console.error("[Todos] Failed to create todo:", err);
      announce(t("todos:error.create"));
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await toggleTodo.mutateAsync({ id });
      announce(completed ? t("todos:markedActive") : t("todos:markedComplete"));
    } catch (err) {
      console.error("[Todos] Failed to toggle todo:", err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo.mutateAsync({ id });
      announce(t("todos:deleted"));
    } catch (err) {
      console.error("[Todos] Failed to delete todo:", err);
      announce(t("todos:error.delete"));
    }
  };

  // Filter todos
  const todos = data?.todos || [];
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>{t("todos:loading")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleSmall]}>
          {t("todos:title")}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t("todos:summary", { active: activeCount, completed: completedCount })}
        </Text>
      </View>

      {/* Error State */}
      {isError && (
        <View style={styles.errorBanner} role="alert" aria-live="assertive">
          <Text style={styles.errorText}>{error?.message || t("todos:error.load")}</Text>
        </View>
      )}

      {/* Add Todo Form */}
      <View style={styles.addTodoCard}>
        <View style={styles.addTodoRow}>
          <TextInput
            style={styles.addTodoInput}
            nativeID={newTodoInputId}
            placeholder={t("todos:placeholder")}
            placeholderTextColor="#9ca3af"
            value={newTodoTitle}
            onChangeText={setNewTodoTitle}
            onSubmitEditing={handleCreateTodo}
            returnKeyType="done"
            accessibilityLabel={t("todos:newTodoLabel")}
            testID="todos-new-input"
          />
          <Pressable
            onPress={handleCreateTodo}
            disabled={!newTodoTitle.trim() || createTodo.isPending}
            style={[
              styles.addTodoButton,
              (!newTodoTitle.trim() || createTodo.isPending) && styles.addTodoButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("todos:addButton")}
            accessibilityState={{ disabled: !newTodoTitle.trim() || createTodo.isPending }}
            testID="todos-add-button"
          >
            {createTodo.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Plus size={20} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow} role="tablist">
        {(["all", "active", "completed"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              filter === f ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === f }}
            accessibilityLabel={t(`todos:filter.${f}`)}
            testID={`todos-filter-${f}`}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
              ]}
            >
              {t(`todos:filter.${f}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <View style={styles.emptyState}>
          <Circle size={48} color="#d1d5db" />
          <Text style={styles.emptyStateText}>{t(`todos:empty.${filter}`)}</Text>
        </View>
      ) : (
        <View style={styles.todoList} role="list">
          {filteredTodos.map((todo) => (
            <View key={todo.id} style={styles.todoItem} role="listitem">
              <View style={styles.todoContent}>
                <Pressable
                  onPress={() => handleToggleTodo(todo.id, todo.completed)}
                  disabled={toggleTodo.isPending}
                  style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: todo.completed, disabled: toggleTodo.isPending }}
                  accessibilityLabel={`${todo.title}, ${todo.completed ? t("todos:completed", "completed") : t("todos:active", "active")}`}
                  testID={`todo-checkbox-${todo.id}`}
                >
                  {todo.completed && <Check size={14} color="#ffffff" />}
                </Pressable>

                <View style={styles.todoTextContainer}>
                  <Text style={[styles.todoTitle, todo.completed && styles.todoTitleCompleted]}>
                    {todo.title}
                  </Text>
                  {todo.description && (
                    <Text style={styles.todoDescription}>{todo.description}</Text>
                  )}
                  {todo.dueDate && (
                    <View style={styles.dueDateRow}>
                      <Calendar size={12} color="#9ca3af" />
                      <Text style={styles.dueDateText}>
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={() => handleDeleteTodo(todo.id)}
                  disabled={deleteTodo.isPending}
                  style={styles.deleteButton}
                  accessibilityRole="button"
                  accessibilityLabel={t("todos:deleteButton", {
                    title: todo.title,
                    defaultValue: `Delete ${todo.title}`,
                  })}
                  accessibilityState={{ disabled: deleteTodo.isPending }}
                  testID={`todo-delete-${todo.id}`}
                >
                  <Trash2 size={18} color="#f87171" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Stats */}
      {todos.length > 0 && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {activeCount} item{activeCount !== 1 ? "s" : ""} left
          </Text>
          {completedCount > 0 && (
            <Text style={styles.completedCountText}>{completedCount} completed</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerTitleSmall: {
    fontSize: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  addTodoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
  },
  addTodoRow: {
    flexDirection: "row",
    gap: 8,
  },
  addTodoInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addTodoButton: {
    backgroundColor: "#dc2626",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addTodoButtonDisabled: {
    opacity: 0.5,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#dc2626",
  },
  filterButtonInactive: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  filterButtonTextInactive: {
    color: "#374151",
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 16,
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
  },
  todoList: {
    gap: 8,
  },
  todoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  todoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  todoTextContainer: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  todoTitleCompleted: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  todoDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  dueDateText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  deleteButton: {
    padding: 8,
  },
  statsBar: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  completedCountText: {
    fontSize: 14,
    color: "#dc2626",
  },
});

export default TodosScreen;
