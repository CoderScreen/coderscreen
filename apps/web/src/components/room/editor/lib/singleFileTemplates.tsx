import { WorkspaceTemplate } from '@/components/room/editor/lib/languageTemplate';

// TypeScript single file template
export const TYPESCRIPT_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.ts',
    code: `// TypeScript Hello World
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`,
  },
];

// JavaScript single file template
export const JAVASCRIPT_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.js',
    code: `// JavaScript Hello World
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`,
  },
];

// Python single file template
export const PYTHON_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.py',
    code: `# Python Hello World
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    message = greet("World")
    print(message)
`,
  },
];

// Bash single file template
export const BASH_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/script.sh',
    code: `#!/bin/bash

# Bash Hello World
echo "Hello, World!"

# Function example
greet() {
    echo "Hello, $1!"
}

greet "World"
`,
  },
];

// Rust single file template
export const RUST_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.rs',
    code: `// Rust Hello World
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    let message = greet("World");
    println!("{}", message);
}
`,
  },
];

// C++ single file template
export const CPP_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.cpp',
    code: `// C++ Hello World
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::string message = greet("World");
    std::cout << message << std::endl;
    return 0;
}
`,
  },
];

// C single file template
export const C_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.c',
    code: `// C Hello World
#include <stdio.h>
#include <string.h>

void greet(const char* name) {
    printf("Hello, %s!\\n", name);
}

int main() {
    greet("World");
    return 0;
}
`,
  },
];

// Java single file template
export const JAVA_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/Main.java',
    code: `// Java Hello World
public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static void main(String[] args) {
        String message = greet("World");
        System.out.println(message);
    }
}
`,
  },
];

// Go single file template
export const GO_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.go',
    code: `// Go Hello World
package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    message := greet("World")
    fmt.Println(message)
}
`,
  },
];

// PHP single file template
export const PHP_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.php',
    code: `<?php
// PHP Hello World
function greet($name) {
    return "Hello, " . $name . "!";
}

$message = greet("World");
echo $message . "\\n";
?>
`,
  },
];

// Ruby single file template
export const RUBY_SINGLE_FILE_TEMPLATE: WorkspaceTemplate = [
  {
    path: '/main.rb',
    code: `# Ruby Hello World
def greet(name)
  "Hello, #{name}!"
end

message = greet("World")
puts message
`,
  },
];
