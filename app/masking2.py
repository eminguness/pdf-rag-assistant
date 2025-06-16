import re
import json
import hashlib
from transformers import AutoModelForTokenClassification, AutoTokenizer, pipeline

# Model ve Tokenizer yükleniyor
model = AutoModelForTokenClassification.from_pretrained("akdeniz27/bert-base-turkish-cased-ner")
tokenizer = AutoTokenizer.from_pretrained("akdeniz27/bert-base-turkish-cased-ner")
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

def mask_sensitive_info(text):
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '<<EPOSTA>>', text)
    text = re.sub(r'(\+90\s*|0)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}', '<<TELEFON>>', text)
    text = re.sub(r'\b[1-9]\d{10}\b', '<<TCKIMLIK>>', text)
    return text

def split_text(text, max_tokens=500):
    words = text.split()
    chunks, current_chunk, current_len = [], [], 0
    for word in words:
        tokens = len(tokenizer.tokenize(word)) + 1
        if current_len + tokens > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk, current_len = [word], tokens
        else:
            current_chunk.append(word)
            current_len += tokens
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

def generate_mask_id(tag_label, original_text):
    normalized_text = original_text.lower().strip()
    hash_code = hashlib.md5(normalized_text.encode()).hexdigest()[:8]
    return f"{tag_label}_{hash_code}"

def mask_entities(text, global_metadata=None):
    text = mask_sensitive_info(text)
    chunks = split_text(text)
    result = []

    metadata = {}
    reverse_lookup = {}

    # Global metadata'yı reverse_lookup olarak kullan
    if global_metadata:
        reverse_lookup = {v.lower(): k for k, v in global_metadata.items()}
        metadata.update(global_metadata)

    for chunk in chunks:
        entities = ner_pipeline(chunk)
        if not entities:
            result.append(chunk)
            continue

        merged_entities = []
        temp_group = [entities[0]]
        for i in range(1, len(entities)):
            prev = temp_group[-1]
            curr = entities[i]
            if curr['entity_group'] == prev['entity_group'] and curr['start'] <= prev['end'] + 2:
                temp_group.append(curr)
            else:
                merged_entities.append(temp_group)
                temp_group = [curr]
        merged_entities.append(temp_group)

        offset = 0
        temp = chunk
        for group in sorted(merged_entities, key=lambda x: x[0]['start']):
            start = group[0]['start'] + offset
            end = group[-1]['end'] + offset
            label = group[0]['entity_group']

            tag_map = {"PER": "Person", "ORG": "Kurum", "LOC": "Yer"}
            if label in tag_map:
                tag_label = tag_map[label]
                original_text = temp[start:end].strip().lower()

                if original_text in reverse_lookup:
                    tag_id = reverse_lookup[original_text]
                else:
                    tag_id = generate_mask_id(tag_label, original_text)
                    reverse_lookup[original_text] = tag_id
                    metadata[tag_id] = original_text

                tag = f"<{tag_id}>"
                temp = temp[:start] + tag + temp[end:]
                offset += len(tag) - (end - start)

        result.append(temp)

    masked_text = " ".join(result)
    return masked_text.lower(), metadata
