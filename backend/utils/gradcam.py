import cv2
import numpy as np
import tensorflow as tf

def preprocess_image(img_path):
    img = cv2.imread(img_path)
    original_img = img.copy()
    
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = img/255.0

    img_array = np.expand_dims(img, axis=0) # since model expects data in batch
    
    return img_array, original_img


def compute_heatmap(img_array, model, last_conv_layer):
    # 1. Creating a model that gives last conv layer output + predicitons
    grad_model = tf.keras.models.Model(
        inputs = model.inputs,
        outputs = [
            model.get_layer(last_conv_layer).output,
            model.output
        ]
    )
    
    # 2. Tracking Gradients
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        
        if isinstance(predictions, list):
            predictions = predictions[0]
        
        pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]
    
    # 3. Compute gradients
    grads = tape.gradient(class_channel, conv_outputs)
    
    # 4. Average gradients (1, 7, 7, 1024) → (1024,)
    pooled_grads = tf.reduce_mean(grads, axis=(0,1,2))
    
    # 5. Multiply feature maps by importance
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    
    # 6. Normalize
    heatmap = tf.maximum(heatmap, 0)/tf.reduce_max(heatmap)
    
    return heatmap.numpy(), pred_index.numpy()


def generate_gradcam(img, model, last_conv_layer):
    # Preprocess image
    original_img = img.copy()
    
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = img/255.0

    img_array = np.expand_dims(img, axis=0)

    # Generate heatmap
    heatmap, pred_index = compute_heatmap(img_array, model, last_conv_layer)
    
    # Resize
    heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
    
    # Color map
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    # Overlay heatmap 
    output_img = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)
    
    # Save image
    #cv2.imwrite(output_path, output_img)
    
    # return image (convert image to bytes)
    _, buffer = cv2.imencode('.png', output_img)
    heatmap_bytes = buffer.tobytes()
    
    return heatmap_bytes, pred_index
    
