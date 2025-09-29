import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request format", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content || "";

    // Mock AI response for now
    const mockResponse = generateMockResponse(userQuery);

    // Return a streaming response that @ai-sdk/react expects
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the response in chunks to simulate streaming
        const chunks = mockResponse.split(' ');
        let index = 0;
        
        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '');
            controller.enqueue(encoder.encode(chunk));
            index++;
            setTimeout(sendChunk, 50); // Small delay to simulate streaming
          } else {
            controller.close();
          }
        };
        
        sendChunk();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

function generateMockResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("firewall") || lowerQuery.includes("security")) {
    return `I can help you with Cloudflare firewall rules! Based on your query about "${query}", here are some common firewall configurations:

1. **Rate Limiting**: Set up rules to limit requests per IP
2. **Geographic Blocking**: Block or allow traffic from specific countries
3. **IP Access Rules**: Whitelist or blacklist specific IP addresses
4. **Bot Management**: Configure rules to block malicious bots

Would you like me to help you create a specific firewall rule?`;
  }

  if (lowerQuery.includes("dns") || lowerQuery.includes("domain")) {
    return `I can assist with DNS management! For your query "${query}", here are some DNS-related tasks I can help with:

1. **DNS Records**: Create, update, or delete A, AAAA, CNAME, MX records
2. **DNS Analytics**: View DNS query statistics and performance
3. **DNS Security**: Configure DNSSEC and DNS filtering
4. **Subdomain Management**: Set up subdomains and wildcard records

What specific DNS configuration do you need help with?`;
  }

  if (
    lowerQuery.includes("ssl") ||
    lowerQuery.includes("certificate") ||
    lowerQuery.includes("https")
  ) {
    return `SSL/TLS configuration is important for security! For "${query}", I can help with:

1. **SSL/TLS Settings**: Configure encryption levels and protocols
2. **Certificate Management**: Monitor certificate expiration and renewal
3. **HTTPS Redirects**: Set up automatic HTTP to HTTPS redirects
4. **Edge Certificates**: Manage Cloudflare's edge certificates

Would you like me to check your current SSL configuration or help set up new certificates?`;
  }

  if (lowerQuery.includes("cache") || lowerQuery.includes("performance")) {
    return `Performance optimization is key! For your query "${query}", here are caching and performance options:

1. **Cache Rules**: Configure what gets cached and for how long
2. **Browser Cache TTL**: Set cache headers for different content types
3. **Purge Cache**: Clear cached content when needed
4. **Page Rules**: Set up custom caching rules for specific URLs

What performance optimization would you like to implement?`;
  }

  // Default response
  return `Thank you for your question: "${query}"

I'm your Cloudflare AI Assistant and I can help you with:

🔒 **Security**: Firewall rules, DDoS protection, bot management
🌐 **DNS**: Record management, analytics, security settings  
🔐 **SSL/TLS**: Certificate management, encryption settings
⚡ **Performance**: Caching, optimization, page rules
📊 **Analytics**: Traffic insights, security events, performance metrics

What would you like to configure or learn more about?`;
}
