import { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Task = {
  id: string;
  title: string;
};

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const nextId = useRef(0);

  function addTask() {
    if (task.trim() === "") return;
    setTasks([...tasks, { id: String(nextId.current++), title: task }]);
    setTask("");
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Enter task"
          onSubmitEditing={addTask}
          returnKeyType="done"
        />

        <MyButton title="Add" onPress={addTask} />

        <FlatList
          style={styles.list}
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item.title}</Text>
          )}
        />
      </View>
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
};

function MyButton({ title, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    // The web tab bar is absolutely positioned over the top of the screen.
    paddingTop: Platform.OS === "web" ? 80 : 24,
  },

  content: {
    width: "100%",
    maxWidth: 420,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },

  buttonPressed: {
    backgroundColor: "#1d4ed8",
    opacity: 0.9,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  list: {
    flexGrow: 0,
    marginTop: 16,
    maxHeight: 240,
  },

  item: {
    paddingVertical: 10,
    fontSize: 16,
  },
});
