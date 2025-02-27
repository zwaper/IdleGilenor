import math

def hero_dps(level, base_dps, dps_increase, is_exponential, scaling_factor=1.07):
    if is_exponential:
        return base_dps * (scaling_factor ** (level - 1))
    else:
        return base_dps + (level - 1) * dps_increase

def hero_cost(level, base_cost, cost_scaling):
    return base_cost * (cost_scaling ** (level - 1))

def gold_drop(zone, base_gold=1, scaling_factor=1.15):
    return base_gold * (scaling_factor ** (zone - 1))

def simulate_hero_progression(start_level, max_level, base_dps, dps_increase, base_cost, cost_scaling, is_exponential, scaling_factor):
    print(f"{'Level':<10}{'DPS':<15}{'Cost':<15}")
    print("-" * 40)
    for level in range(start_level, max_level + 1):
        dps = hero_dps(level, base_dps, dps_increase, is_exponential, scaling_factor)
        cost = hero_cost(level, base_cost, cost_scaling)
        print(f"{level:<10}{dps:<15.2f}{cost:<15.2f}")

def simulate_gold_drops(start_zone, max_zone):
    print(f"\n{'Zone':<10}{'Gold Drop':<15}{'Boss/Chest Gold':<15}")
    print("-" * 45)
    for zone in range(start_zone, max_zone + 1):
        gold = gold_drop(zone)
        boss_gold = gold * 10
        print(f"{zone:<10}{gold:<15.2f}{boss_gold:<15.2f}")

def hero_calculator():
    base_dps = float(input("Enter base DPS at level 1: "))
    dps_increase = float(input("Enter DPS increase per level (set to 0 for exponential scaling): "))
    base_cost = float(input("Enter base cost at level 1: "))
    cost_scaling = float(input("Enter cost scaling factor (e.g., 1.07): "))
    is_exponential = input("Is DPS scaling exponential? (yes/no): ").strip().lower() == "yes"
    scaling_factor = 1.07 if is_exponential else 0  # Default exponential factor
    if is_exponential:
        scaling_factor = float(input("Enter DPS scaling factor (e.g., 1.07 for exponential growth): "))
    start_level = int(input("Enter starting level: "))
    max_level = int(input("Enter maximum level: "))
    
    simulate_hero_progression(start_level, max_level, base_dps, dps_increase, base_cost, cost_scaling, is_exponential, scaling_factor)
    
    start_zone = int(input("Enter starting zone: "))
    max_zone = int(input("Enter maximum zone: "))
    simulate_gold_drops(start_zone, max_zone)

if __name__ == "__main__":
    hero_calculator()
