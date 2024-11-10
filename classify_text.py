import sys
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

def classify_text(text, threshold=0.45):
    # Load the model from the best checkpoint
    model_path = './best_model'
    tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
    model = AutoModelForSequenceClassification.from_pretrained(
        model_path,
        num_labels=2,
        problem_type="single_label_classification"
    )
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    model.eval()

    inputs = tokenizer(
        text,
        truncation=True,
        padding='max_length',
        max_length=128,
        return_tensors='pt'
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        green_flag_prob = probabilities[0][0].item()
        red_flag_prob = probabilities[0][1].item()
        
        print(f"Green Flag probability: {green_flag_prob:.4f}")
        print(f"Red Flag probability: {red_flag_prob:.4f}")
        
        # Using threshold for classification
        predicted_class = 1 if red_flag_prob > threshold else 0
        confidence = max(red_flag_prob, green_flag_prob)

    label_mapping = {0: 'Green Flag', 1: 'Red Flag'}
    label = label_mapping[predicted_class]

    print('harmful' if label == 'Red Flag' else 'non-harmful')
    sys.stderr.write(f"Confidence: {confidence:.2%}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
        classify_text(text)
    else:
        print("Please provide text to classify") 