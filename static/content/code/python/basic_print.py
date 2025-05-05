# This is a simple Python script example.

def greet(name):
  """This function greets the person passed in as a parameter."""
  print(f"Hello, {name}! Welcome to Python.")

# Get user input (or use a default name)
user_name = input("Enter your name: ") if __name__ == "__main__" else "Typing Enthusiast"

# Call the function
greet(user_name)

print("Python can print numbers too:", 123)
print("And do basic math:", 5 * 8)