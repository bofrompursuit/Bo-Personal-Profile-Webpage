import qrcode
import os
import subprocess

# 1. Configuration
phone_number = "16469669675" 
wa_url = f"https://wa.me/{phone_number}"
# Save to assets folder
image_path = "assets/whatsapp_qr.png"

# Ensure assets directory exists
os.makedirs("assets", exist_ok=True)

# 2. Generate QR Code Image
print("Generating QR code...")
qr = qrcode.QRCode(box_size=10, border=4)
qr.add_data(wa_url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save(image_path)

print(f"QR code saved as {image_path}.")

# 3. Git Push Automation
def run_git_commands():
    try:
        print("Pushing to GitHub...")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "chore: update whatsapp qr code and new sections"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Successfully pushed to GitHub!")
    except subprocess.CalledProcessError as e:
        print(f"Error during Git operations: {e}")

if __name__ == "__main__":
    run_git_commands()
