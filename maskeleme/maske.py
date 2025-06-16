import re
import json
import pdfplumber
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


import hashlib

def generate_mask_id(tag_label, original_text):
    # Orijinal metni küçük harfe çevir, boşlukları kaldır, hashle
    normalized_text = original_text.lower().strip()
    hash_code = hashlib.md5(normalized_text.encode()).hexdigest()[:8]
    return f"{tag_label}_{hash_code}"

def mask_entities(text):
    text = mask_sensitive_info(text)
    chunks = split_text(text)
    result = []

    metadata = {}
    reverse_lookup = {}

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
                original_text = temp[start:end].strip()

                if original_text in reverse_lookup:
                    tag_id = reverse_lookup[original_text]
                else:
                    tag_id = generate_mask_id(tag_label, original_text)
                    metadata[tag_id] = original_text
                    reverse_lookup[original_text] = tag_id

                tag = f"<{tag_id}>"
                temp = temp[:start] + tag + temp[end:]
                offset += len(tag) - (end - start)

        result.append(temp)

    masked_text = " ".join(result)
    return masked_text, metadata



def save_jsonl(metadata, path):
    with open(path, 'w', encoding='utf-8') as f:
        for key, value in metadata.items():
            json.dump({key: value}, f, ensure_ascii=False)
            f.write('\n')


def process_file(input_pdf, output_txt, output_jsonl):
    with pdfplumber.open(input_pdf) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    text = re.sub(r'\s+', ' ', text).strip()

    masked_text, metadata = mask_entities(text)

    # Maskeleme sonrası küçük harfe çevirme
    masked_text = masked_text.lower()
    metadata = {k: v.lower() for k, v in metadata.items()}

    with open(output_txt, 'w', encoding='utf-8') as f:
        f.write(masked_text)

    save_jsonl(metadata, output_jsonl)


# Örnek kullanım
if __name__ == "__main__":
    process_file(
        input_pdf="C:\\Users\\Emin\\Desktop\\flask_rag_app\\maskeleme\\muhammed_emin_gunes_cv.pdf",
        output_txt="maskeleme/belge.txt",
        output_jsonl="maskeleme/belge.json"
    )
