export type LifeEntry = {
    name: string;
    desc?: string;
}

export type LifeEntries = {
    [date: string]: LifeEntry;
}

export type LifeinweeksConfig = Partial<{
    startDate: string;
    endYear: number;
    birthday: Partial<{
        show: boolean;
        date: string;
        text: string;
    }>;
    decades: Record<string, string>;
    [key: string]: unknown; // Allow additional config properties
}>

export type ParsedLifeInWeeks = {
    lifeEntries: LifeEntries;
    config: LifeinweeksConfig;
}

export function parseLifeInWeeksMarkdown(content: string): ParsedLifeInWeeks {
    const entries: LifeEntries = {};
    let config: LifeinweeksConfig = {};

    // Extract config from Obsidian comments at the end
    const configMatch = content.match(/%% lifeinweeks:settings\s*```\s*({[\s\S]*?})\s*```\s*%%/);
    if (configMatch) {
        try {
            config = JSON.parse(configMatch[1]);
        } catch (error) {
            console.error('Error parsing lifeinweeks config:', error);
            config = {};
        }
        
        // Remove config section from content before parsing entries
        content = content.replace(/%% lifeinweeks:settings\s*```[\s\S]*?```\s*%%/, '').trim();
    }
    
    // Split by ## headers to get sections
    const sections = content.split(/^## /gm).filter(section => section.trim());
    
    for (const section of sections) {
        const lines = section.split('\n');
        const headerLine = lines[0];
        
        // Extract date and title from header line using regex
        // Matches format: YYYY-MM-DD Title or YYYY-MM-DD: Title
        const headerMatch = headerLine.match(/^(\d{4}-\d{2}-\d{2})(?:\s*:?\s*)(.*)$/);
        
        if (headerMatch) {
            const date = headerMatch[1];
            const name = headerMatch[2].trim();
            
            // Get description (everything after the header line)
            const desc = lines.slice(1).join('\n').trim();
            
            entries[date] = {
                name,
                desc: desc.length === 0 ? undefined : desc
            };
        }
    }
    
    return {
        lifeEntries: entries,
        config
    };
}
