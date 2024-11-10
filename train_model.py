def install_required_packages():
    import subprocess
    import sys
    import importlib.util

    required_packages = {
        'transformers': 'transformers',
        'pandas': 'pandas', 
        'torch': 'torch',
        'numpy': 'numpy',
        'scikit-learn': 'sklearn',
        'accelerate': 'accelerate'
    }

    for package, import_name in required_packages.items():
        if importlib.util.find_spec(import_name) is None:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        else:
            print(f"{package} is already installed")

install_required_packages()

from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import pandas as pd
import torch
import numpy as np
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
from sklearn.model_selection import train_test_split

def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='binary')
    acc = accuracy_score(labels, preds)
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

# Print CUDA information
print("CUDA is available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("Current GPU:", torch.cuda.get_device_name(0))

# Load dataset
data = pd.read_csv('data/output.csv')
print(f"\nTotal samples: {len(data)}")

# Map labels to integers
label_mapping = {'Green Flag': 0, 'Red Flag': 1}
data['label'] = data['Category'].map(label_mapping)

# Calculate class weights for balanced training
class_counts = data['label'].value_counts()
total_samples = len(data)
class_weights = torch.FloatTensor([total_samples / (2 * class_counts[0]), 
                                 total_samples / (2 * class_counts[1])])
print("\nClass weights:", class_weights)

# Split data into train and validation sets
train_texts, val_texts, train_labels, val_labels = train_test_split(
    data['Phrase'].tolist(),
    data['label'].tolist(),
    test_size=0.2,
    stratify=data['label'],
    random_state=42
)

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')

# Tokenize texts
train_encodings = tokenizer(
    train_texts,
    truncation=True,
    padding='max_length',
    max_length=128,
    return_tensors='pt'
)

val_encodings = tokenizer(
    val_texts,
    truncation=True,
    padding='max_length',
    max_length=128,
    return_tensors='pt'
)

# Dataset class
class CustomDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {
            key: val[idx].clone().detach() 
            for key, val in self.encodings.items()
        }
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

# Create datasets
train_dataset = CustomDataset(train_encodings, train_labels)
val_dataset = CustomDataset(val_encodings, val_labels)

# Initialize model
model = AutoModelForSequenceClassification.from_pretrained(
    'distilbert-base-uncased',
    num_labels=2
)

# Custom trainer with weighted loss
class CustomTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits
        loss_fct = torch.nn.CrossEntropyLoss(weight=class_weights.to(logits.device))
        loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))
        return (loss, outputs) if return_outputs else loss

# Training arguments
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=10,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=10,
    eval_steps=50,
    evaluation_strategy="steps",
    save_strategy="steps",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    learning_rate=2e-5,
    remove_unused_columns=True,
    push_to_hub=False,
    report_to="none"
)

# Initialize trainer
trainer = CustomTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics
)

# Train the model
print("\nStarting training...")
trainer.train()

# Save the best model
print("\nSaving the best model...")
trainer.save_model('./best_model')
print("Training completed!")
