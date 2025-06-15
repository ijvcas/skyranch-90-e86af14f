
export class TagManager {
  private static cleanTagValue(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  static prepareTags(customTags?: Array<{ name: string; value: string }>): Array<{ name: string; value: string }> {
    // Create a Map to prevent duplicate tag names (incoming tags take priority)
    const tagMap = new Map<string, string>();
    
    // Add custom tags first (they have priority)
    if (customTags) {
      customTags.forEach(tag => {
        if (tag.name && tag.value) {
          const cleanName = this.cleanTagValue(tag.name);
          const cleanValue = this.cleanTagValue(tag.value);
          tagMap.set(cleanName, cleanValue);
        }
      });
    }

    // Add default tags only if they don't already exist
    if (!tagMap.has('category')) {
      tagMap.set('category', 'notification_v2');
    }
    if (!tagMap.has('sender')) {
      tagMap.set('sender', 'skyranch_v2');
    }
    if (!tagMap.has('version')) {
      tagMap.set('version', '2_0');
    }

    // Convert Map back to array format
    return Array.from(tagMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }
}
