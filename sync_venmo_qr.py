import qrcode
import os

# 1. Configuration
venmo_handle = "beau_moldenhauer"
venmo_url = f"https://venmo.com/u/{venmo_handle}"
# Save to assets folder
image_path = "assets/venmo_qr.png"

# Ensure assets directory exists
os.makedirs("assets", exist_ok=True)

# 2. Generate QR Code Image
print("Generating QR code...")
qr = qrcode.QRCode(box_size=10, border=4)
qr.add_data(venmo_url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save(image_path)

print(f"QR code saved as {image_path}.")
