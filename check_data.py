import pandas as pd

# Load the dataset
data = pd.read_csv('data/output.csv')

# Check class distribution
print("\nClass Distribution:")
print(data['Category'].value_counts())

# Print some examples from each class
print("\nRed Flag Examples:")
print(data[data['Category'] == 'Red Flag']['Phrase'].head())
print("\nGreen Flag Examples:")
print(data[data['Category'] == 'Green Flag']['Phrase'].head()) 