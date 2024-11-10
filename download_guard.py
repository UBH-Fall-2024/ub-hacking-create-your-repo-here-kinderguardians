from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login

# Login to Hugging Face
login("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")

# Download the model
model_name = "microsoft/phi-2"
print(f"Downloading {model_name}...")

# Download tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.save_pretrained("./phi-2")

# Download model
model = AutoModelForCausalLM.from_pretrained(model_name)
model.save_pretrained("./phi-2")

print("Download complete!")