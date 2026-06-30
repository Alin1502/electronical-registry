import fitz  # PyMuPDF
import pytesseract
from PIL import Image

doc = fitz.open("document.pdf")

for page_num in range(len(doc)):
    page = doc.load_page(page_num)

    pix = page.get_pixmap(dpi=300)

    img = Image.frombytes(
        "RGB",
        [pix.width, pix.height],
        pix.samples
    )

    text = pytesseract.image_to_string(img)

    print(f"Page {page_num + 1}")
    print(text)