def install_required_packages():
    import subprocess
    import sys
    import importlib.util

    required_packages = {
        'pandas': 'pandas',
        'scikit-learn': 'sklearn',
        'datasets': 'datasets',
        'transformers': 'transformers'
    }

    for package, import_name in required_packages.items():
        if importlib.util.find_spec(import_name) is None:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        else:
            print(f"{package} is already installed")

install_required_packages()

import pandas as pd
from sklearn.model_selection import train_test_split 
from datasets import Dataset

# Load the dataset
data = pd.read_csv('C:/Studies/Projects/UBHack/ub-hacking-create-your-repo-here-kinderguardians/data/output.csv')
print("Available columns:", data.columns.tolist())

# Update label mapping to match actual categories
label_mapping = {'Red Flag': 1, 'Green Flag': 0}

print("Number of NA values:", data['Category'].isna().sum())
print("Unique values in Category:", data['Category'].unique())

# Handle any unexpected values
data['Category'] = data['Category'].fillna('Red Flag')
data['Category'] = data['Category'].map(label_mapping)

# Print intermediate values to debug
print("Values after mapping:", data['Category'].unique())
print("Data types:", data['Category'].dtype)

# Force conversion to integer using a different method
data['Category'] = pd.to_numeric(data['Category'], downcast='integer')

print("Final data types:", data['Category'].dtype)
print("Final unique values:", data['Category'].unique())

# Convert to integer explicitly
data['Category'] = data['Category'].astype('int32')

# Split the data
train_texts, val_texts, train_labels, val_labels = train_test_split(
    data['Phrase'], data['Category'], test_size=0.2, random_state=42  # Changed from 'text' to 'Phrase'
)

from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained('C:/Studies/Projects/UBHack/ub-hacking-create-your-repo-here-kinderguardians/phi-2')
# Add these lines to set up padding token
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = 'right'

def create_dataset(texts, labels):
    encodings = tokenizer(texts.tolist(), truncation=True, padding=True)
    dataset_dict = {
        'input_ids': encodings['input_ids'],
        'attention_mask': encodings['attention_mask'],
        'labels': labels.tolist()
    }
    print("Labels shape:", len(dataset_dict['labels']))
    print("Sample labels:", dataset_dict['labels'][:5])
    return Dataset.from_dict(dataset_dict)

# Create datasets
train_dataset = create_dataset(train_texts, train_labels)
val_dataset = create_dataset(val_texts, val_labels)
