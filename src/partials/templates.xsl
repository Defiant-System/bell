<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="calls">
	<xsl:for-each select="./*">
		<xsl:sort order="ascending" select="@stamp"/>
		<xsl:variable name="user" select="//Friends/i[@id = current()/@username]"/>

		<div>
			<xsl:attribute name="class">
				contact
				<xsl:if test="$user/@online = '1'"> online</xsl:if>
				<xsl:if test="@duration = '0'"> missed</xsl:if>
			</xsl:attribute>
			<span class="avatar"></span>
			<div class="details">
				<span class="name">
					<i class="icon-online"></i>
					<xsl:value-of select="$user/@name"/>
				</span>
				<span class="last-call">
					<i class="icon-camera">
						<xsl:if test="@type = 'voice'">
							<xsl:attribute name="class">icon-phone</xsl:attribute>
						</xsl:if>
					</i>
					<i class="icon-out">
						<xsl:if test="@inbound = '0'">
							<xsl:attribute name="class">icon-in</xsl:attribute>
						</xsl:if>
					</i>
					<xsl:value-of select="@timestamp"/>
				</span>
			</div>
			<div class="actions">
				<i class="icon-info" data-click="get-call-info"></i>
			</div>
		</div>
	</xsl:for-each>
</xsl:template>

</xsl:stylesheet>