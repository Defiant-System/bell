<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="calls">
	<xsl:for-each select="./*">
		<xsl:sort order="ascending" select="@stamp"/>
		<xsl:variable name="user" select="//Friends/i[@id = current()/@username]"/>

		<div>
			<xsl:attribute name="class">
				call-entry
				<xsl:if test="$user/@online = '1'"> online</xsl:if>
				<xsl:if test="@duration = '0'"> missed</xsl:if>
			</xsl:attribute>
			<span class="avatar">
				<xsl:if test="$user/@avatar">
					<xsl:attribute name="style">background-image: url(<xsl:value-of select="$user/@avatar"/>);</xsl:attribute>
				</xsl:if>
			</span>
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
				<div data-click="start-camera-call">
					<i class="icon-camera"></i>
				</div>
				<div data-click="start-voice-call">
					<i class="icon-phone"></i>
				</div>
			</div>
		</div>
	</xsl:for-each>
</xsl:template>

<xsl:template name="friends">
	<xsl:for-each select="./*">
		<div>
			<xsl:attribute name="class">
				friend
				<xsl:if test="@online = '1'"> online</xsl:if>
			</xsl:attribute>
			<i class="icon-offline"></i>
			<div class="name">
				<xsl:value-of select="@name"/>
			</div>
			<div class="actions">
				<div data-click="start-camera-call">
					<i class="icon-camera"></i>
				</div>
				<div data-click="start-voice-call">
					<i class="icon-phone"></i>
				</div>
			</div>
		</div>
	</xsl:for-each>
</xsl:template>

</xsl:stylesheet>