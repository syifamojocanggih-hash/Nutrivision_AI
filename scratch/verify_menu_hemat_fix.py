import re

def test_menu_hemat():
    print("=== TEST 1: Inspecting frontend/js/budget_planner.js ===")
    with open('frontend/js/budget_planner.js', 'r', encoding='utf-8') as f:
        bp_js = f.read()

    assert "this.isPlanGenerated = true;" in bp_js, "budgetPlanner constructor must initialize isPlanGenerated to true"
    assert "this.isPlanGenerated = true;" in bp_js, "budgetPlanner init() must ensure isPlanGenerated is true"
    assert "if (!this.plan || this.plan.length === 0)" in bp_js, "render() must guard against empty plan"
    print("✓ budget_planner.js initializes isPlanGenerated to true and guards against empty plan")

    print("\n=== TEST 2: Inspecting frontend/js/app.js ===")
    with open('frontend/js/app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    # Verify openMealPlannerMode('hemat') ensures plan is generated and rendered
    hemat_block_match = re.search(r"openMealPlannerMode\(mode = 'standar'.*?if \(mode === 'standar'\) \{.*?\} else \{(.*?)\}\s+if \(window\.lucide", app_js, re.DOTALL)
    assert hemat_block_match, "Could not find openMealPlannerMode block in app.js"
    hemat_block = hemat_block_match.group(1)

    assert "secHemat.style.display = 'block'" in hemat_block, "secHemat must be displayed block"
    assert "window.budgetPlanner.isPlanGenerated = true" in hemat_block, "window.budgetPlanner.isPlanGenerated must be set true"
    assert "window.budgetPlanner.render()" in hemat_block, "window.budgetPlanner.render() must be called"
    print("✓ app.openMealPlannerMode('hemat') properly activates and renders budget planner")

    # Verify navigate('planner') when mode is hemat
    nav_match = re.search(r"if \(sectionId === 'planner'\) \{(.*?)\}\s+if \(sectionId === 'progress'\)", app_js, re.DOTALL)
    assert nav_match, "Could not find sectionId === 'planner' block in app.js"
    nav_block = nav_match.group(1)
    assert "else if (this.plannerActiveMode === 'hemat')" in nav_block, "plannerActiveMode === 'hemat' must be handled"
    assert "window.budgetPlanner.render()" in nav_block, "plannerActiveMode === 'hemat' must call render()"
    print("✓ app.navigate('planner') preserves hemat state with full re-render")

    print("\n=== TEST 3: Inspecting frontend/index.html ===")
    with open('frontend/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    assert 'id="planner-section-hemat"' in html, "Missing #planner-section-hemat"
    assert 'id="budget-input-amount" value="Rp 200.000"' in html, "#budget-input-amount must have default Rp 200.000"
    assert 'id="tab-btn-recom-standar"' in html, "Missing #tab-btn-recom-standar in index.html"
    assert 'id="tab-btn-recom-hemat"' in html, "Missing #tab-btn-recom-hemat in index.html"
    print("✓ index.html has pre-filled budget amount and recommendation tabs")

    print("\n🎉 ALL VERIFICATION CHECKS PASSED FOR MENU HEMAT FIX!")

if __name__ == '__main__':
    test_menu_hemat()
