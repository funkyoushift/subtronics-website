/**
 * Subtronics PC Builder App
 * Updated with Microcenter pricing + $250 build fee
 */

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

const BUILD_FEE = 250; // $250 build fee

/**
 * Initialize the app
 */
async function init() {
    try {
        buildsData = getEmbeddedData();
        renderBuilder();
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('builderApp').innerHTML = '<div class="loading">Error loading configurations. Please refresh.</div>';
    }
}

/**
 * Get embedded data with Microcenter pricing
 */
function getEmbeddedData() {
    return {
        "meta": {
            "updated_at": new Date().toISOString(),
            "source": "Microcenter + $250 Build Fee",
            "version": "2.0.0"
        },
        "global": {
            "build_fee": 250,
            "max_hdd_drives": 8,
            "default_m2_slots": 2
        },
        "builds": [
            {
                "sku": "BUNDLE-GAMING-ENTRY",
                "name": "Entry Level Gaming PC",
                "description": "Perfect for 1080p gaming and everyday tasks",
                "cpu": "AMD Ryzen 5 5600",
                "motherboard": "ASRock B550M Pro4",
                "ram_base_gb": 16,
                "case_fixed": "NZXT H510 Flow",
                "m2_slots": 2,
                "bundle_price": 450  // Microcenter cost
            },
            {
                "sku": "BUNDLE-GAMING-MID",
                "name": "Mid-Range Gaming PC",
                "description": "Great for 1440p gaming with high settings",
                "cpu": "AMD Ryzen 7 5800X3D",
                "motherboard": "ASUS TUF Gaming X570-Plus",
                "ram_base_gb": 32,
                "case_fixed": "Lian Li Lancool II Mesh",
                "m2_slots": 3,
                "bundle_price": 750  // Microcenter cost
            },
            {
                "sku": "BUNDLE-GAMING-HIGH",
                "name": "High-End Gaming PC",
                "description": "4K gaming and content creation powerhouse",
                "cpu": "AMD Ryzen 9 7950X",
                "motherboard": "MSI MPG X670E Carbon WiFi",
                "ram_base_gb": 64,
                "case_fixed": "Corsair 5000D Airflow",
                "m2_slots": 4,
                "bundle_price": 1200  // Microcenter cost
            },
            {
                "sku": "BUNDLE-WORKSTATION",
                "name": "Professional Workstation",
                "description": "For video editing, 3D rendering, and professional work",
                "cpu": "AMD Threadripper 7960X",
                "motherboard": "ASRock TRX50 WS",
                "ram_base_gb": 128,
                "case_fixed": "Fractal Define 7 XL",
                "m2_slots": 4,
                "bundle_price": 2400  // Microcenter cost
            },
            {
                "sku": "BUNDLE-INTEL-GAMING",
                "name": "Intel Gaming Build",
                "description": "High performance Intel-based gaming system",
                "cpu": "Intel Core i7-14700K",
                "motherboard": "ASUS ROG Strix Z790-E",
                "ram_base_gb": 32,
                "case_fixed": "NZXT H7 Flow",
                "m2_slots": 4,
                "bundle_price": 950  // Microcenter cost
            },
            {
                "sku": "BUNDLE-COMPACT",
                "name": "Compact Gaming Build",
                "description": "Small form factor with big performance",
                "cpu": "AMD Ryzen 7 7800X3D",
                "motherboard": "ASUS ROG Strix B650E-I",
                "ram_base_gb": 32,
                "case_fixed": "Cooler Master NR200P",
                "m2_slots": 2,
                "bundle_price": 850  // Microcenter cost
            }
        ],
        "price_tables": {
            "ram_per_32gb_increment": 80,  // Microcenter pricing
            "gpu_tiers": [
                { "tier": "None", "name": "No GPU (Integrated Graphics)", "cost": 0 },
                { "tier": "Budget", "name": "AMD RX 6600 (8GB)", "cost": 200 },
                { "tier": "Entry", "name": "NVIDIA RTX 4060 (8GB)", "cost": 300 },
                { "tier": "Mid", "name": "NVIDIA RTX 4060 Ti (16GB)", "cost": 500 },
                { "tier": "High", "name": "AMD RX 7800 XT (16GB)", "cost": 520 },
                { "tier": "High+", "name": "NVIDIA RTX 4070 Super (12GB)", "cost": 620 },
                { "tier": "Premium", "name": "NVIDIA RTX 4070 Ti Super (16GB)", "cost": 820 },
                { "tier": "Enthusiast", "name": "AMD RX 7900 XTX (24GB)", "cost": 950 },
                { "tier": "Ultra", "name": "NVIDIA RTX 4080 Super (16GB)", "cost": 1050 },
                { "tier": "Extreme", "name": "NVIDIA RTX 4090 (24GB)", "cost": 1700 }
            ],
            "hdd": [
                { "capacity_tb": 0, "cost": 0, "name": "No HDD" },
                { "capacity_tb": 1, "cost": 45, "name": "1TB Seagate BarraCuda 7200RPM" },
                { "capacity_tb": 2, "cost": 55, "name": "2TB WD Blue 7200RPM" },
                { "capacity_tb": 4, "cost": 90, "name": "4TB Seagate IronWolf NAS" },
                { "capacity_tb": 6, "cost": 135, "name": "6TB WD Black 7200RPM" },
                { "capacity_tb": 8, "cost": 170, "name": "8TB Seagate IronWolf NAS" }
            ],
            "nvme": [
                { "capacity_tb": 0, "cost": 0, "name": "No Additional NVMe" },
                { "capacity_tb": 0.5, "cost": 50, "name": "500GB WD Blue SN580 Gen4" },
                { "capacity_tb": 1, "cost": 80, "name": "1TB Samsung 980 Pro Gen4" },
                { "capacity_tb": 2, "cost": 150, "name": "2TB WD Black SN850X Gen4" },
                { "capacity_tb": 4, "cost": 300, "name": "4TB Samsung 990 Pro Gen4" }
            ]
        }
    };
}

/**
 * Calculate total price (Parts + $250 Build Fee)
 */
function calculatePrice() {
    if (!selectedBuild) return 0;
    
    let partsCost = selectedBuild.bundle_price;
    const pt = buildsData.price_tables;
    
    // RAM upgrade
    const ramInc = Math.max(0, (configuration.ram_gb - selectedBuild.ram_base_gb) / 32);
    partsCost += ramInc * (pt.ram_per_32gb_increment || 80);
    
    // GPU
    const gpu = pt.gpu_tiers.find(g => g.tier === configuration.gpu_tier);
    if (gpu) partsCost += gpu.cost;
    
    // HDD
    const hdd = pt.hdd.find(h => h.capacity_tb === configuration.hdd_capacity_tb);
    if (hdd) partsCost += hdd.cost * configuration.hdd_count;
    
    // NVMe
    const nvme = pt.nvme.find(n => n.capacity_tb === configuration.nvme_capacity_tb);
    if (nvme) partsCost += nvme.cost * configuration.nvme_slots_used;
    
    // Cooling
    if (configuration.cooling === 'AIO240') partsCost += 100;
    if (configuration.cooling === 'AIO360_LCD') partsCost += 300;
    
    // RGB
    if (configuration.rgb === 'RGB') partsCost += 50;
    
    // Add $250 build fee
    const total = partsCost + BUILD_FEE;
    
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
                    <p class="price">Starting at $${(build.bundle_price + BUILD_FEE).toFixed(2)}</p>
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
                    ${pt.gpu_tiers.map(gpu => `
                        <option value="${gpu.tier}" ${configuration.gpu_tier === gpu.tier ? 'selected' : ''}>
                            ${gpu.name}${gpu.cost > 0 ? ' (+$' + gpu.cost + ')' : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="option-group">
                <label for="hdd-capacity">HDD Storage</label>
                <select id="hdd-capacity" onchange="updateConfig('hdd_capacity_tb', parseFloat(this.value))">
                    ${pt.hdd.map(hdd => `
                        <option value="${hdd.capacity_tb}" ${configuration.hdd_capacity_tb === hdd.capacity_tb ? 'selected' : ''}>
                            ${hdd.name} ${hdd.cost > 0 ? '(+$' + hdd.cost + ' each)' : ''}
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
                            ${nvme.name} ${nvme.cost > 0 ? '(+$' + nvme.cost + ' each)' : ''}
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
                    <option value="Air" ${configuration.cooling === 'Air' ? 'selected' : ''}>Stock Air Cooling (Included)</option>
                    <option value="AIO240" ${configuration.cooling === 'AIO240' ? 'selected' : ''}>240mm AIO Liquid Cooler (+$100)</option>
                    <option value="AIO360_LCD" ${configuration.cooling === 'AIO360_LCD' ? 'selected' : ''}>360mm LCD AIO Cooler (+$300)</option>
                </select>
            </div>
            
            <div class="option-group">
                <label for="rgb">RGB Lighting</label>
                <select id="rgb" onchange="updateConfig('rgb', this.value)">
                    <option value="NoRGB" ${configuration.rgb === 'NoRGB' ? 'selected' : ''}>No RGB</option>
                    <option value="RGB" ${configuration.rgb === 'RGB' ? 'selected' : ''}>RGB Lighting Kit (+$50)</option>
                </select>
            </div>
        </div>
        
        <div class="price-summary">
            <h3 style="margin-bottom: 1rem;">Price Summary</h3>
            <div class="price-row">
                <span>Parts (Microcenter Cost)</span>
                <span>$${(calculatePrice() - BUILD_FEE).toFixed(2)}</span>
            </div>
            <div class="price-row">
                <span>Build & Assembly Fee</span>
                <span>$${BUILD_FEE.toFixed(2)}</span>
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
    
    // Base build
    breakdown += `<div class="price-row"><span>Base Build (${selectedBuild.name})</span><span>$${selectedBuild.bundle_price}</span></div>`;
    
    // RAM
    if (configuration.ram_gb > selectedBuild.ram_base_gb) {
        const cost = ((configuration.ram_gb - selectedBuild.ram_base_gb) / 32) * pt.ram_per_32gb_increment;
        breakdown += `<div class="price-row"><span>RAM Upgrade (${configuration.ram_gb}GB)</span><span>+$${cost}</span></div>`;
    }
    
    // GPU
    const gpu = pt.gpu_tiers.find(g => g.tier === configuration.gpu_tier);
    if (gpu && gpu.cost > 0) {
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
        breakdown += `<div class="price-row"><span>240mm AIO Cooling</span><span>+$100</span></div>`;
    } else if (configuration.cooling === 'AIO360_LCD') {
        breakdown += `<div class="price-row"><span>360mm LCD AIO Cooling</span><span>+$300</span></div>`;
    }
    
    // RGB
    if (configuration.rgb === 'RGB') {
        breakdown += `<div class="price-row"><span>RGB Lighting</span><span>+$50</span></div>`;
    }
    
    return breakdown;
}

/**
 * Select a build
 */
function selectBuild(sku) {
    selectedBuild = buildsData.builds.find(b => b.sku === sku);
    
    // Reset configuration with first GPU selected
    configuration = {
        ram_gb: selectedBuild.ram_base_gb,
        gpu_tier: buildsData.price_tables.gpu_tiers[0]?.tier || 'None',
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
    const partsCost = price - BUILD_FEE;
    
    let details = `Build: ${selectedBuild.name}\n`;
    details += `Parts Cost: $${partsCost.toFixed(2)}\n`;
    details += `Build Fee: $${BUILD_FEE.toFixed(2)}\n`;
    details += `Total: $${price.toFixed(2)}\n\n`;
    details += `Configuration:\n`;
    details += `- RAM: ${configuration.ram_gb}GB\n`;
    
    const gpu = buildsData.price_tables.gpu_tiers.find(g => g.tier === configuration.gpu_tier);
    if (gpu) details += `- GPU: ${gpu.name}\n`;
    
    if (configuration.hdd_count > 0) {
        details += `- HDDs: ${configuration.hdd_count}x ${configuration.hdd_capacity_tb}TB\n`;
    }
    if (configuration.nvme_slots_used > 0) {
        details += `- NVMe: ${configuration.nvme_slots_used}x ${configuration.nvme_capacity_tb}TB\n`;
    }
    details += `- Cooling: ${configuration.cooling}\n`;
    details += `- RGB: ${configuration.rgb}\n`;
    
    alert(`Thank you for your interest!\n\n${details}\nPlease contact us at contact@subtronicsllc.com to complete your order.`);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
