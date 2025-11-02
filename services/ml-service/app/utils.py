import typing
import pickle
import numpy as np
from pathlib import Path
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Fix typing issue if needed
if hasattr(typing, '_SpecialForm') and hasattr(typing, 'Optional'):
    try:
        typing.Optional[list]
    except TypeError:
        from typing import _SpecialForm
        def _patched_getitem(self, parameters):
            if not isinstance(parameters, tuple):
                parameters = (parameters,)
            return self._name, parameters
        _SpecialForm.__getitem__ = _patched_getitem

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent

# Load encoder and decoder models
try:
    encoder_model = load_model(str(PROJECT_ROOT / "models" / "encoder_model.h5"))
    decoder_model = load_model(str(PROJECT_ROOT / "models" / "decoder_model.h5"))
    
    # Load input tokenizer
    with open(str(PROJECT_ROOT / "models" / "input_tokenizer.pkl"), "rb") as f:
        input_tokenizer = pickle.load(f)
    
    # Load target tokenizer
    with open(str(PROJECT_ROOT / "models" / "target_tokenizer.pkl"), "rb") as f:
        target_tokenizer = pickle.load(f)
    
    # Load max lengths
    with open(str(PROJECT_ROOT / "models" / "Max_lengths.pkl"), "rb") as f:
        max_length = pickle.load(f)  # should be a dict: {"input": X, "target": Y}
    
    print("✅ All models and tokenizers loaded successfully!")
    
except FileNotFoundError as e:
    print(f"⚠️  Model files not found: {e}")
    print("Models will be loaded when available")
    encoder_model = decoder_model = None
    input_tokenizer = target_tokenizer = None
    max_length = {"input": 50, "target": 100}

def predict_sql(nl_query: str) -> str:
    """
    Convert natural language query to SQL using Seq2Seq model
    
    Args:
        nl_query: Natural language question
    
    Returns:
        SQL query
    """
    if encoder_model is None or decoder_model is None:
        # Placeholder if models not loaded
        return f"SELECT * FROM table WHERE condition LIKE '%{nl_query}%'"
    
    try:
        # Convert input text to sequence
        input_seq = input_tokenizer.texts_to_sequences([nl_query])
        input_seq = pad_sequences(input_seq, maxlen=max_length["input"], padding="post")
        
        # Encode input
        states_value = encoder_model.predict(input_seq, verbose=0)
        
        # Generate empty target sequence with start token
        target_seq = np.zeros((1, 1))
        target_seq[0, 0] = target_tokenizer.word_index.get('<start>', 1)
        
        stop_condition = False
        decoded_sentence = ''
        
        while not stop_condition:
            output_tokens, h, c = decoder_model.predict([target_seq] + states_value, verbose=0)
            
            # Sample the next word
            sampled_token_index = np.argmax(output_tokens[0, -1, :])
            sampled_word = target_tokenizer.index_word.get(sampled_token_index, '<end>')
            
            if sampled_word == '<end>' or len(decoded_sentence.split()) > max_length["target"]:
                stop_condition = True
            else:
                decoded_sentence += ' ' + sampled_word
            
            # Update target sequence and states
            target_seq = np.zeros((1, 1))
            target_seq[0, 0] = sampled_token_index
            states_value = [h, c]
        
        return decoded_sentence.strip()
    
    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        return f"SELECT * FROM table WHERE condition LIKE '%{nl_query}%'"
