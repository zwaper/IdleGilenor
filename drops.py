import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import quote
from dataclasses import dataclass

@dataclass
class WikiItem:
    name: str
    quantity: str
    quantity_str: str
    rarity: float
    rarity_str: str
    image_url: str

@dataclass
class DropTableSection:
    header: str
    tables: dict  # {subheader: [WikiItem]}

class OSRSWikiScraper:
    BASE_URL = "https://oldschool.runescape.wiki"
    HEADERS = {
        "User-Agent": "OSRSDropScraper/1.0 (contact@example.com)",
        "Accept-Language": "en-US,en;q=0.9"
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)
    
    def get_monster_url(self, monster_name: str, monster_id: int = None) -> str:
        """Build wiki URL considering special cases"""
        # Handle special cases
        if monster_id in (7851, 7852) or monster_name.lower() in ("dusk", "dawn"):
            return f"{self.BASE_URL}/w/Grotesque_Guardians"
            
        if monster_id:
            return f"{self.BASE_URL}/w/Special:Lookup?type=npc&id={monster_id}"
            
        sanitized = quote(monster_name.replace(" ", "_"))
        return f"{self.BASE_URL}/w/{sanitized}"
    
    def parse_rarity(self, text: str) -> tuple:
        """Convert rarity text to numeric value"""
        text = text.lower().split("(")[0].strip()
        rarity_map = {
            "always": (1.0, "Always"),
            "common": (6.25, "Common"),
            "uncommon": (1.56, "Uncommon"),
            "rare": (0.78, "Rare"),
            "very rare": (0.19, "Very Rare")
        }
        
        if text in rarity_map:
            return rarity_map[text]
        
        if "/" in text:
            try:
                num, den = text.split("/")
                value = float(num) / float(den)
                return (value, text)
            except:
                pass
                
        return (None, text)
    
    def parse_quantity(self, text: str) -> tuple:
        """Parse quantity string into (min, max, display)"""
        text = text.replace("–", "-").replace("−", "-").strip()
        
        if text.lower() == "noted":
            return (1, 1, "Noted")
            
        if "-" in text:
            parts = text.split("-")
            if len(parts) == 2:
                return (int(parts[0]), int(parts[1]), text)
                
        try:
            qty = int(text)
            return (qty, qty, str(qty))
        except:
            return (None, None, text)
    
    def scrape_drops(self, monster_name: str, monster_id: int = None) -> list:
        """Main scraping function"""
        url = self.get_monster_url(monster_name, monster_id)
        response = self.session.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        
        sections = []
        current_section = None
        
        # Find all relevant headers
        headers = soup.select("h2 span.mw-headline, h3 span.mw-headline, h4 span.mw-headline")
        
        for header in headers:
            header_text = header.get_text(strip=True)
            parent = header.find_parent(["h2", "h3", "h4"])
            
            # Skip non-drop sections
            if not self._is_drop_section(monster_name, header_text, parent.name):
                continue
            
            # New main section
            if parent.name == "h2":
                if current_section:
                    sections.append(current_section)
                current_section = DropTableSection(header=header_text, tables={})
            else:
                # Subsection
                if current_section:
                    subheader = header_text
                    table = self._parse_subtable(parent)
                    if table:
                        current_section.tables[subheader] = table
        
        if current_section:
            sections.append(current_section)
            
        return sections
    
    def _is_drop_section(self, monster_name: str, header_text: str, tag_name: str) -> bool:
        """Determine if a section contains drop tables"""
        header_lower = header_text.lower()
        monster_lower = monster_name.lower()
        
        # Skip known non-drop sections
        skip_conditions = [
            (monster_lower == "hespori" and header_text == "Main table"),
            (monster_lower == "chaos elemental" and header_text == "Major drops"),
            (monster_lower == "undead druid" and header_text == "Seeds")
        ]
        
        if any(skip_conditions):
            return False
            
        # Generic drop detection
        return any(word in header_lower for word in ["drop", "loot", "reward"])
    
    def _parse_subtable(self, header_element) -> list:
        """Parse individual drop table"""
        table = header_element.find_next_sibling("table", class_="item-drops")
        if not table:
            return []
            
        items = []
        
        for row in table.select("tr:has(td)"):
            cols = row.find_all("td")
            if len(cols) < 4:
                continue
                
            # Extract image URL
            img = cols[0].find("img")
            image_url = f"{self.BASE_URL}{img['src']}" if img else ""
            
            # Item name
            name = cols[1].get_text(strip=True)
            if name.endswith("(m)"):
                name = name[:-3].strip()
                
            # Quantity
            qty_text = cols[2].get_text(strip=True)
            _, _, qty_display = self.parse_quantity(qty_text)
            
            # Rarity
            rarity_text = cols[3].get_text(strip=True)
            rarity_value, rarity_display = self.parse_rarity(rarity_text)
            
            items.append(WikiItem(
                name=name,
                quantity=qty_display,
                quantity_str=qty_text,
                rarity=rarity_value,
                rarity_str=rarity_display,
                image_url=image_url
            ))
            
        return items

# Example usage
if __name__ == "__main__":
    scraper = OSRSWikiScraper()
    
    # Test with Grotesque Guardians
    drops = scraper.scrape_drops("Grotesque Guardians")
    
    # Convert to JSON-serializable format
    result = []
    for section in drops:
        section_data = {
            "header": section.header,
            "tables": {}
        }
        for subheader, items in section.tables.items():
            section_data["tables"][subheader] = [
                {
                    "name": item.name,
                    "quantity": item.quantity,
                    "rarity": item.rarity,
                    "image_url": item.image_url
                }
                for item in items
            ]
        result.append(section_data)
    
    with open("drops.json", "w") as f:
        json.dump(result, f, indent=2)
    
    print("Data saved to drops.json")
    time.sleep(2)  # Rate limiting