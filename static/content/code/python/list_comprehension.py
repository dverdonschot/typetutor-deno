# Python list comprehensions provide a concise way to create lists.

# Example 1: Squares of numbers
numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers]
print("Squares:", squares) # Output: Squares: [1, 4, 9, 16, 25]

# Example 2: Filtering even numbers
evens = [n for n in numbers if n % 2 == 0]
print("Evens:", evens) # Output: Evens: [2, 4]

# Example 3: Creating a list of tuples
pairs = [(n, n**2) for n in numbers]
print("Pairs:", pairs) # Output: Pairs: [(1, 1), (2, 4), (3, 9), (4, 16), (5, 25)]

# Example 4: Conditional expression within comprehension
parity = ["even" if n % 2 == 0 else "odd" for n in numbers]
print("Parity:", parity) # Output: Parity: ['odd', 'even', 'odd', 'even', 'odd']