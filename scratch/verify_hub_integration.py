import os
import re

index_html_path = 'frontend/index.html'
app_js_path = 'frontend/js/app.js'
dashboard_css_path = 'frontend/css/dashboard.css'

with open(index_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

with open(app_js_path, 'r', encoding='utf-8') as f:
    app_js = f.read()

with open(dashboard_css_path, 'r', encoding='utf-8') as f:
    css = f.read()

print("=== Checking Hub and Sections in index.html ===")
assert 'id="planner-hub-screen"' in html, "Missing #planner-hub-screen"
assert 'id="planner-section-standar"' in html, "Missing #planner-section-standar"
assert 'id="planner-section-hemat"' in html, "Missing #planner-section-hemat"
assert 'id="overview-meal-planner-card"' in html, "Missing #overview-meal-planner-card"
print("✓ Hub & mode sections found in index.html")

print("=== Checking Budget Planner Required IDs in index.html ===")
required_budget_ids = [
    'budget-input-amount',
    'budget-kpi-daily-quota',
    'budget-kpi-total-cost',
    'budget-kpi-savings',
    'budget-kpi-avg-protein',
    'budget-week-tabs-box',
    'budget-day-navigator-box',
    'budget-active-day-title',
    'budget-active-day-sub',
    'meal-card-breakfast',
    'meal-card-lunch',
    'meal-card-dinner',
    'modal-budget-grocery',
    'budget-grocery-list-container',
    'budget-grocery-total-text',
    'budget-grocery-title',
    'budget-grocery-subtitle',
    'ov-card3-streak-badge',
    'ov-card3-streak-text',
    'weekly-bar-chart-box',
    'ov-weekly-avg-text'
]

for bid in required_budget_ids:
    assert f'id="{bid}"' in html, f"Missing budget ID in index.html: {bid}"
print(f"✓ All {len(required_budget_ids)} required budget IDs present in index.html")

print("=== Checking Calendar & Symptom Required Elements in index.html ===")
required_cal_sym_ids = [
    'planner-symptom-chips',
    'symptom-restrictions-section',
    'symptom-restriction-input',
    'btn-add-symptom-restriction',
    'symptom-result-box',
    'planner-calendar-card',
    'cal-header-condition-label',
    'recovery-month-pills',
    'recovery-month-target-banner',
    'calendar-detail-panel',
    'upcoming-date-text',
    'upcoming-events-list',
    'pantangan-events-list',
    'calendar-picker-range-text',
    'integrated-cal-body'
]

for cid in required_cal_sym_ids:
    assert f'id="{cid}"' in html, f"Missing calendar/symptom ID in index.html: {cid}"
print(f"✓ All {len(required_cal_sym_ids)} required calendar & symptom IDs present in index.html")

print("=== Checking app.js Methods ===")
assert 'showPlannerHub()' in app_js, "Missing showPlannerHub() in app.js"
assert 'openMealPlannerMode(' in app_js, "Missing openMealPlannerMode() in app.js"
assert 'this.openMealPlannerMode(\'standar\')' in app_js, "Missing call to openMealPlannerMode('standar')"
assert 'this.openMealPlannerMode(\'hemat\')' in app_js, "Missing call to openMealPlannerMode('hemat')"
print("✓ App methods verified")

print("=== Checking CSS Classes in dashboard.css ===")
assert '.planner-hub-container' in css, "Missing .planner-hub-container in css"
assert '.planner-gateway-grid' in css, "Missing .planner-gateway-grid in css"
assert '.planner-subnav-bar' in css, "Missing .planner-subnav-bar in css"
print("✓ CSS classes verified")

print("\n🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!")
