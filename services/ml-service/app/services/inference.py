import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import logging
import os
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class InferenceService:
    """Service for LSTM model inference"""
    
    def __init__(self, model_path: str):
        # Convert to Path object for cross-platform compatibility
        self.model_path = Path(model_path).resolve()
        self.encoder_model = None
        self.decoder_model = None
        self.input_tokenizer = None
        self.target_tokenizer = None
        self.max_lengths = None
        self.models_loaded = False
    
    def load_models(self):
        """Load all models and tokenizers"""
        try:
            logger.info(f"Loading models from: {self.model_path}")
            
            # Check if model directory exists
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model directory not found: {self.model_path}")
            
            # Load encoder and decoder models - use Path for cross-platform
            encoder_path = self.model_path / "encoder_model.h5"
            decoder_path = self.model_path / "decoder_model.h5"
            
            logger.info(f"Loading encoder from: {encoder_path}")
            if not encoder_path.exists():
                raise FileNotFoundError(f"Encoder model not found: {encoder_path}")
            self.encoder_model = load_model(str(encoder_path))
            
            logger.info(f"Loading decoder from: {decoder_path}")
            if not decoder_path.exists():
                raise FileNotFoundError(f"Decoder model not found: {decoder_path}")
            self.decoder_model = load_model(str(decoder_path))
            
            # Load tokenizers
            input_tokenizer_path = self.model_path / "input_tokenizer.pkl"
            target_tokenizer_path = self.model_path / "target_tokenizer.pkl"
            
            logger.info(f"Loading input tokenizer from: {input_tokenizer_path}")
            if not input_tokenizer_path.exists():
                raise FileNotFoundError(f"Input tokenizer not found: {input_tokenizer_path}")
            with open(input_tokenizer_path, "rb") as f:
                self.input_tokenizer = pickle.load(f)
            
            logger.info(f"Loading target tokenizer from: {target_tokenizer_path}")
            if not target_tokenizer_path.exists():
                raise FileNotFoundError(f"Target tokenizer not found: {target_tokenizer_path}")
            with open(target_tokenizer_path, "rb") as f:
                self.target_tokenizer = pickle.load(f)
            
            # Load max lengths
            max_lengths_path = self.model_path / "Max_lengths.pkl"
            logger.info(f"Loading max lengths from: {max_lengths_path}")
            if not max_lengths_path.exists():
                raise FileNotFoundError(f"Max lengths not found: {max_lengths_path}")
            with open(max_lengths_path, "rb") as f:
                self.max_lengths = pickle.load(f)
            
            logger.info(f"Max lengths: {self.max_lengths}")
            
            self.models_loaded = True
            logger.info("✅ All models loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            raise RuntimeError(f"Failed to load models: {e}")
    
    def predict_sql(self, nl_query: str) -> str:
        """
        Convert natural language query to SQL
        
        Args:
            nl_query: Natural language query string
            
        Returns:
            Generated SQL query string
        """
        if not self.models_loaded:
            raise RuntimeError("Models not loaded")
        
        try:
            # Preprocess input
            input_seq = self.input_tokenizer.texts_to_sequences([nl_query.lower()])
            input_seq = pad_sequences(
                input_seq, 
                maxlen=self.max_lengths["input"], 
                padding="post"
            )
            
            # Encode input
            states_value = self.encoder_model.predict(input_seq, verbose=0)
            
            # Initialize target sequence with start token
            target_seq = np.zeros((1, 1))
            start_token = self.target_tokenizer.word_index.get('startseq', 1)
            target_seq[0, 0] = start_token
            
            # Generate SQL query word by word
            stop_condition = False
            decoded_sentence = ''
            max_iterations = self.max_lengths["target"]
            iteration = 0
            
            while not stop_condition:
                output_tokens, h, c = self.decoder_model.predict(
                    [target_seq] + states_value,
                    verbose=0
                )
                
                # Sample the next word
                sampled_token_index = np.argmax(output_tokens[0, -1, :])
                sampled_word = self.target_tokenizer.index_word.get(
                    sampled_token_index, 
                    ''
                )
                
                # Check stop conditions
                if (sampled_word == 'endseq' or 
                    sampled_word == '' or 
                    iteration >= max_iterations):
                    stop_condition = True
                else:
                    decoded_sentence += ' ' + sampled_word
                
                # Update target sequence and states
                target_seq = np.zeros((1, 1))
                target_seq[0, 0] = sampled_token_index
                states_value = [h, c]
                iteration += 1
            
            sql_query = decoded_sentence.strip()
            logger.info(f"Generated SQL: {sql_query}")
            
            return sql_query
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            raise RuntimeError(f"Prediction failed: {e}")
    
    def get_model_info(self) -> Dict:
        """Get information about loaded models"""
        return {
            "models_loaded": self.models_loaded,
            "model_path": str(self.model_path),
            "input_vocab_size": len(self.input_tokenizer.word_index) if self.input_tokenizer else 0,
            "target_vocab_size": len(self.target_tokenizer.word_index) if self.target_tokenizer else 0,
            "max_lengths": self.max_lengths if self.max_lengths else None
        }
