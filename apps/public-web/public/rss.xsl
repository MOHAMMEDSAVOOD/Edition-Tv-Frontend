<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          :root {
            --bg: #09090b;
            --card: #18181b;
            --text: #f4f4f5;
            --muted: #a1a1aa;
            --border: #27272a;
            --primary: #ffffff;
            --accent: #eab308;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          
          .header {
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 1px solid var(--border);
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .header h1 svg {
            color: var(--accent);
          }
          
          .header p {
            color: var(--muted);
            margin: 0 0 20px 0;
            font-size: 16px;
          }
          
          .badge {
            display: inline-block;
            background-color: var(--card);
            border: 1px solid var(--border);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            font-family: monospace;
            color: var(--accent);
          }
          
          .article {
            background-color: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            transition: border-color 0.2s;
          }
          
          .article:hover {
            border-color: #52525b;
          }
          
          .article h2 {
            margin: 0 0 10px 0;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.3;
          }
          
          .article h2 a {
            color: var(--primary);
            text-decoration: none;
          }
          
          .article h2 a:hover {
            text-decoration: underline;
          }
          
          .article .meta {
            font-size: 13px;
            color: var(--muted);
            margin-bottom: 12px;
            font-family: monospace;
          }
          
          .article p {
            margin: 0;
            color: #d4d4d8;
            font-size: 15px;
          }
          
          .notice {
            background-color: rgba(234, 179, 8, 0.1);
            border-left: 4px solid var(--accent);
            padding: 16px;
            margin-bottom: 30px;
            font-size: 14px;
            color: #d4d4d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="notice">
            <strong>RSS Feed</strong> — You are viewing an RSS feed. Subscribe to this URL using a news reader (like Feedly or NetNewsWire) to get updates automatically.
          </div>
          
          <div class="header">
            <h1>
              <svg xmlns="http://www.w3.org/2005/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 11a9 9 0 0 1 9 9"></path>
                <path d="M4 4a16 16 0 0 1 16 16"></path>
                <circle cx="5" cy="19" r="1"></circle>
              </svg>
              <xsl:value-of select="/rss/channel/title"/>
            </h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <div class="badge">Valid RSS 2.0</div>
          </div>
          
          <div class="articles">
            <xsl:for-each select="/rss/channel/item">
              <div class="article">
                <h2>
                  <a href="{link}">
                    <xsl:value-of select="title"/>
                  </a>
                </h2>
                <div class="meta">
                  Published: <xsl:value-of select="pubDate"/>
                </div>
                <p><xsl:value-of select="description"/></p>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
