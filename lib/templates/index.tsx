import { FileCode, LayoutTemplate, Film, LucideIcon } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  files: {
    [path: string]: string;
  };
}

export const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start with an empty React Native app',
    icon: FileCode,
    files: {
      'App.tsx': `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello React Native!</Text>
      <Text style={styles.subtitle}>Welcome to RN Playground</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
`,
    },
  },
  {
    id: 'components-demo',
    name: 'Components Demo',
    description: 'Showcase common React Native components',
    icon: LayoutTemplate,
    files: {
      'App.tsx': `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Components Demo</Text>
        <Text style={styles.subtitle}>React Native building blocks</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Button</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>Clicked {count} times</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Image</Text>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>🖼️</Text>
          <Text style={styles.caption}>Image component</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Styled Views</Text>
        <View style={styles.colorBoxes}>
          <View style={[styles.box, { backgroundColor: '#FF6B6B' }]} />
          <View style={[styles.box, { backgroundColor: '#4ECDC4' }]} />
          <View style={[styles.box, { backgroundColor: '#45B7D1' }]} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
    padding: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageText: {
    fontSize: 48,
  },
  caption: {
    marginTop: 8,
    color: '#666',
  },
  colorBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});
`,
    },
  },
  {
    id: 'animations',
    name: 'Animations',
    description: 'Simple animation example',
    icon: Film,
    files: {
      'App.tsx': `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handlePress = () => {
    setScale(scale === 1 ? 1.2 : 1);
    setRotation(rotation + 45);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CSS Animations</Text>
      <Text style={styles.subtitle}>
        Click the box below to animate it
      </Text>

      <View 
        style={[
          styles.box,
          {
            transform: [
              { scale },
              { rotate: \`\${rotation}deg\` }
            ],
            transition: 'all 0.3s ease-in-out',
          }
        ]}
      >
        <Text style={styles.boxText}>✨</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Animate</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: Web animations use CSS transitions.
        Native animations would use Animated API.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  box: {
    width: 120,
    height: 120,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  boxText: {
    fontSize: 48,
  },
  button: {
    backgroundColor: '#34C759',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    marginTop: 40,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
`,
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
