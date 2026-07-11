from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "assets" / "tripline-ticket-referencia.png"
TICKET_PDF = ROOT / "assets" / "tripline-ticket-simulado.pdf"
BOARDING_PDF = ROOT / "assets" / "tripline-boleto-simulado.pdf"


def fit_on_page(image: Image.Image, page_size: tuple[int, int], margin: int, bg: str) -> Image.Image:
    page = Image.new("RGB", page_size, bg)
    working = image.convert("RGB")
    working.thumbnail((page_size[0] - margin * 2, page_size[1] - margin * 2), Image.Resampling.LANCZOS)
    x = (page_size[0] - working.width) // 2
    y = (page_size[1] - working.height) // 2
    page.paste(working, (x, y))
    return page


def main() -> None:
    image = Image.open(IMAGE_PATH)
    image = ImageOps.exif_transpose(image)

    ticket_page = fit_on_page(image, (900, 1200), 42, "white")
    ticket_page.save(TICKET_PDF, "PDF", resolution=150.0)

    boarding_page = fit_on_page(image, (1200, 760), 52, "white")
    boarding_page.save(BOARDING_PDF, "PDF", resolution=150.0)

    print(f"Created {TICKET_PDF}")
    print(f"Created {BOARDING_PDF}")


if __name__ == "__main__":
    main()
