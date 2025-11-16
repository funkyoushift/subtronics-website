/**
 * Subtronics PC Builder App
 */

const API_URL = 'https://subtronics-data.YOUR-ACCOUNT.workers.dev/builds.json';
const API_ENDPOINT = 'https://subtronics-api.YOUR-ACCOUNT.workers.dev/create';

let buildsData = null;
let selectedBuild = null;
let configuration = {
    ram_gb: 16,
    gpu_tier: '',
    hdd_capacity_tb: 0,
    hdd_count: 0,
    nvme_capacity_tb: 0,
    nvme_slots_used: 0,
    cooling: 'Air',
    rgb: 'NoRGB'
};

/**
 * Initialize the app
 */
async function init() {
    try {
        await loadBuildsData();
        renderBuilder();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to load PC configurations. Please refresh the page.');
    }
}

/**
 * Load builds data from API
 */
async function loadBuildsData() {
    try {
        // Try to load from the data worker
        // For now, we'll use embedded data since the worker isn't deployed yet
        buildsData = getEmbeddedData();
        
        if (buildsData && buildsData.builds) {
            console.log('Loaded', buildsData.builds.length, 'build configurations');
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Error loading builds:', error);
        buildsData = getEmbeddedData();
    }
}

/**
 * Get embedded fallback data
 */
function getEmbeddedData() {
    return {
        "meta": {
            "updated_at": new Date().toISOString(),
            "source": "Local",
            "version": "1.0.0"
        },
        "global": {
            "profit_margin_percent": 15,
            "max_hdd_drives": 8,
            "default_m2_slots": 2
        },
        "builds": [
            {
                "sku": "BUNDLE-GAMING-ENTRY",
                "name": "Entry Level Gaming PC",
                "description": "Perfect for 1080p gaming",
                "cpu": "AMD Ryzen 5 5600",
                "motherboard": "ASRock B550M Pro4",
                "ram_base_gb": 16,
                "case_fixed": "NZXT H510 Flow",
                "m2_slots": 2,
                "bundle_price": 450
            },
            {
                "sku": "BUNDLE-GAMING-MID",
                "name": "Mid-Range Gaming PC",
                "description": "Great for 1440p gaming",
                "cpu": "AMD Ryzen 7 5800X3D",
                "motherboard": "ASUS TUF Gaming X570-Plus",
                "ram_base_gb": 32,
                "case_fixed": "Lian Li Lancool II Mesh",
                "m2_slots": 3,
                "bundle_price": 750
            },
            {
                "sku": "BUNDLE-GAMING-HIGH",
                "name": "High-End Gaming PC",
                "description": "4K gaming powerhouse",
                "cpu": "AMD Ryzen 9 7950X",
                "motherboard": "MSI MPG X670E Carbon WiFi",
                "ram_base_gb": 64,
                "case_fixed": "Corsair 5000D Airflow",
                "m2_slots": 4,
                "bundle_price": 1200
            }
        ],
        "price_tables": {
            "ram_per_32gb_increment": 75,
            "gpu_tiers": [
                { "tier": "Budget", "name": "AMD RX 6600", "cost": 200 },
                { "tier": "Entry", "name": "NVIDIA RTX 4060", "cost": 300 },
                { "tier": "Mid", "name": "NVIDIA RTX 4060 Ti", "cost": 450 },
                { "tier": "High", "name": "AMD RX 7800 XT", "cost": 500 },
                { "tier": "Ultra", "name": "NVIDIA RTX 4080", "cost": 1000 }
            ],
            "hdd": [
                { "capacity_tb": 0, "cost": 0, "name": "No HDD" },
                { "capacity_tb": 1, "cost": 42, "name": "1TB HDD" },
                { "capacity_tb": 2, "cost": 55, "name": "2TB HDD" },
                { "capacity_tb": 4, "cost": 85, "name": "4TB HDD" }
            ],
            "nvme": [
                { "capacity_tb": 0, "cost": 0, "name": "No Additional NVMe" },
                { "capacity_tb": 0.5, "cost": 45, "name": "500GB NVMe" },
                { "capacity_tb": 1, "cost": 75, "name": "1TB NVMe" },
                { "capacity_tb": 2, "cost": 140, "name": "2TB NVMe" }
            ]
        }
    };
}

/**
 * Calculate total price
 */
function calculatePrice() {
    if (!selectedBuild) return 0;
    
    let total = selectedBuild.bundle_price;
    const pt = buildsData.price_tables;
    
    // RAM upgrade
    const ramInc = Math.max(0, (configuration.ram_gb - selectedBuild.ram_base_gb) / 32);
    total += ramInc * (pt.ram_per_32gb_increment || 75);
    
    // GPU
    const gpu = pt.gpu_tiers.find(g => g.tier === configuration.gpu_tier);
    if (gpu) total += gpu.cost;
    
    // HDD
    const hdd = pt.hdd.find(h => h.capacity_tb === configuration.hdd_capacity_tb);
    if (hdd) total += hdd.cost * configuration.hdd_count;
    
    // NVMe
    const nvme = pt.nvme.find(n => n.capacity_tb === configuration.nvme_capacity_tb);
    if (nvme) total += nvme.cost * configuration.nvme_slots_used;
    
    // Cooling
    if (configuration.cooling === 'AIO240') total += 95;
    if (configuration.cooling === 'AIO360_LCD') total += 290;
    
    // RGB
    if (configuration.rgb === 'RGB') total += 45;
    
    // Apply margin
    const margin = buildsData.global.profit_margin_percent || 15;
    total = total * (1 + margin / 100);
    
    return Math.round(total * 100) / 100;
}

/**
 * Render the PC builder interface
 */
function renderBuilder() {
    const container = document.getElementById('builderApp');
    
    container.innerHTML = `
        <div class="build-selector">
            ${buildsData.builds.map(build => `
                <div class="build-card ${selectedBuild?.sku === build.sku ? 'selected' : ''}" 
                     onclick="selectBuild('${build.sku}')">
                    <h3>${build.name}</h3>
                    <p class="price">Starting at $${build.bundle_price}</p>
                    <p>${build.description || ''}</p>
                    <div class="specs">
                        <p><strong>CPU:</strong> ${build.cpu}</p>
                        <p><strong>Motherboard:</strong> ${build.motherboard}</p>
                        <p><strong>Base RAM:</strong> ${build.ram_base_gb}GB</p>
                        <p><strong>Case:</strong> ${build.case_fixed}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${selectedBuild ? renderCustomizationPanel() : '<p style="text-align:center; color: #666; margin-top: 2rem;">Select a build above to customize</p>'}
    `;
}

/**
 * Render customization panel
 */
function renderCustomizationPanel() {
    const pt = buildsData.price_tables;
    
    return `
        <div class="customization-panel">
            <h3 style="margin-bottom: 1.5rem; color: var(--dark);">Customize Your Build</h3>
            
            <div class="option-group">
                <label for="ram">RAM</label>
                <select id="ram" onchange="updateConfig('ram_gb', parseInt(this.value))">
                    ${[16, 32, 64, 128].map(gb => `
                        <option value="${gb}" ${configuration.ram_gb === gb ? 'selected' : ''}>
                            ${gb}GB ${gb > selectedBuild.ram_base_gb ? '(+$' + ((gb - selectedBuild.ram_base_gb) / 32 * pt.ram_per_32gb_increment) + ')' : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="option-group">
                <label for="gpu">Graphics Card</label>
                <select id="gpu" onchange="updateConfig('gpu_tier', this.value)">
                    <option value="">No GPU</option>
                    ${pt.gpu_tiers.map(gpu => `
                        <option value="${gpu.tier}" ${configuration.gpu_tier === gpu.tier ? 'selected' : ''}>
                            ${gpu.name} - $${gpu.cost}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="option-group">
                <label for="hdd-capacity">HDD Storage</label>
                <select id="hdd-capacity" onchange="updateConfig('hdd_capacity_tb', parseFloat(this.value))">
                    ${pt.hdd.map(hdd => `
                        <option value="${hdd.capacity_tb}" ${configuration.hdd_capacity_tb === hdd.capacity_tb ? 'selected' : ''}>
                            ${hdd.name} ${hdd.cost > 0 ? '- $' + hdd.cost : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="option-group">
                <label for="hdd-count">Number of HDDs</label>
                <input type="number" id="hdd-count" min="0" max="8" value="${configuration.hdd_count}" 
                       onchange="updateConfig('hdd_count', parseInt(this.value))">
            </div>
            
            <div class="option-group">
                <label for="nvme-capacity">Additional NVMe SSD</label>
                <select id="nvme-capacity" onchange="updateConfig('nvme_capacity_tb', parseFloat(this.value))">
                    ${pt.nvme.map(nvme => `
                        <option value="${nvme.capacity_tb}" ${configuration.nvme_capacity_tb === nvme.capacity_tb ? 'selected' : ''}>
                            ${nvme.name} ${nvme.cost > 0 ? '- $' + nvme.cost : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="option-group">
                <label for="nvme-count">Number of NVMe SSDs</label>
                <input type="number" id="nvme-count" min="0" max="${selectedBuild.m2_slots}" 
                       value="${configuration.nvme_slots_used}" 
                       onchange="updateConfig('nvme_slots_used', parseInt(this.value))">
            </div>
            
            <div class="option-group">
                <label for="cooling">CPU Cooling</label>
                <select id="cooling" onchange="updateConfig('cooling', this.value)">
                    <option value="Air" ${configuration.cooling === 'Air' ? 'selected' : ''}>Air Cooling (Included)</option>
                    <option value="AIO240" ${configuration.cooling === 'AIO240' ? 'selected' : ''}>240mm AIO (+$95)</option>
                    <option value="AIO360_LCD" ${configuration.cooling === 'AIO360_LCD' ? 'selected' : ''}>360mm LCD AIO (+$290)</option>
                </select>
            </div>
            
            <div class="option-group">
                <label for="rgb">RGB Lighting</label>
                <select id="rgb" onchange="updateConfig('rgb', this.value)">
                    <option value="NoRGB" ${configuration.rgb === 'NoRGB' ? 'selected' : ''}>No RGB</option>
                    <option value="RGB" ${configuration.rgb === 'RGB' ? 'selected' : ''}>RGB Lighting (+$45)</option>
                </select>
            </div>
        </div>
        
        <div class="price-summary">
            <h3 style="margin-bottom: 1rem;">Price Summary</h3>
            <div class="price-row">
                <span>Base Build (${selectedBuild.name})</span>
                <span>$${selectedBuild.bundle_price}</span>
            </div>
            ${renderPriceBreakdown()}
            <div class="price-row total">
                <span>Total Price</span>
                <span>$${calculatePrice().toFixed(2)}</span>
            </div>
            <button class="btn" onclick="requestQuote()" style="width: 100%; margin-top: 1.5rem;">
                Request Quote / Order
            </button>
        </div>
    `;
}

/**
 * Render price breakdown
 */
function renderPriceBreakdown() {
    const pt = buildsData.price_tables;
    let breakdown = '';
    
    // RAM
    if (configuration.ram_gb > selectedBuild.ram_base_gb) {
        const cost = ((configuration.ram_gb - selectedBuild.ram_base_gb) / 32) * pt.ram_per_32gb_increment;
        breakdown += `<div class="price-row"><span>RAM Upgrade (${configuration.ram_gb}GB)</span><span>+$${cost}</span></div>`;
    }
    
    // GPU
    const gpu = pt.gpu_tiers.find(g => g.tier === configuration.gpu_tier);
    if (gpu) {
        breakdown += `<div class="price-row"><span>GPU (${gpu.name})</span><span>+$${gpu.cost}</span></div>`;
    }
    
    // Storage
    if (configuration.hdd_count > 0) {
        const hdd = pt.hdd.find(h => h.capacity_tb === configuration.hdd_capacity_tb);
        if (hdd && hdd.cost > 0) {
            breakdown += `<div class="price-row"><span>HDD (${configuration.hdd_count}x ${hdd.capacity_tb}TB)</span><span>+$${hdd.cost * configuration.hdd_count}</span></div>`;
        }
    }
    
    if (configuration.nvme_slots_used > 0) {
        const nvme = pt.nvme.find(n => n.capacity_tb === configuration.nvme_capacity_tb);
        if (nvme && nvme.cost > 0) {
            breakdown += `<div class="price-row"><span>NVMe (${configuration.nvme_slots_used}x ${nvme.capacity_tb}TB)</span><span>+$${nvme.cost * configuration.nvme_slots_used}</span></div>`;
        }
    }
    
    // Cooling
    if (configuration.cooling === 'AIO240') {
        breakdown += `<div class="price-row"><span>240mm AIO Cooling</span><span>+$95</span></div>`;
    } else if (configuration.cooling === 'AIO360_LCD') {
        breakdown += `<div class="price-row"><span>360mm LCD AIO Cooling</span><span>+$290</span></div>`;
    }
    
    // RGB
    if (configuration.rgb === 'RGB') {
        breakdown += `<div class="price-row"><span>RGB Lighting</span><span>+$45</span></div>`;
    }
    
    return breakdown;
}

/**
 * Select a build
 */
function selectBuild(sku) {
    selectedBuild = buildsData.builds.find(b => b.sku === sku);
    
    // Reset configuration
    configuration = {
        ram_gb: selectedBuild.ram_base_gb,
        gpu_tier: buildsData.price_tables.gpu_tiers[0]?.tier || '',
        hdd_capacity_tb: 0,
        hdd_count: 0,
        nvme_capacity_tb: 0,
        nvme_slots_used: 0,
        cooling: 'Air',
        rgb: 'NoRGB'
    };
    
    renderBuilder();
}

/**
 * Update configuration
 */
function updateConfig(key, value) {
    configuration[key] = value;
    renderBuilder();
}

/**
 * Request a quote
 */
function requestQuote() {
    const price = calculatePrice();
    const config = {
        build: selectedBuild.name,
        sku: selectedBuild.sku,
        configuration: configuration,
        total_price: price
    };
    
    alert(`Thank you for your interest!\n\nBuild: ${selectedBuild.name}\nTotal Price: $${price.toFixed(2)}\n\nPlease contact us at contact@subtronicsllc.com to complete your order.`);
    
    console.log('Configuration:', config);
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('builderApp');
    container.innerHTML = `<div class="error">${message}</div>`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
