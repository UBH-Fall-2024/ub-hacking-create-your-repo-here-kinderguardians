from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Load the tokenizer and model from the finetuned directory
tokenizer = AutoTokenizer.from_pretrained('./phi-2-finetuned')
model = AutoModelForSequenceClassification.from_pretrained('./phi-2-finetuned')