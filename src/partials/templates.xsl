<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="calls">
	<xsl:for-each select="./*">
		<xsl:sort order="descending" select="@stamp" data-type="number"/>
		<xsl:call-template name="call-entry" />
	</xsl:for-each>
</xsl:template>

<xsl:template name="friends">
	<xsl:for-each select="./*">
		<xsl:if test="not(@me)">
			<div>
				<xsl:attribute name="data-username"><xsl:value-of select="@id"/></xsl:attribute>
				<xsl:attribute name="class">
					friend
					<xsl:if test="@status = 1"> online</xsl:if>
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
		</xsl:if>
	</xsl:for-each>
</xsl:template>

<xsl:template name="call-entry">
	<xsl:variable name="user" select="//Friends/i[@id = current()/@username]"/>
	<div>
		<xsl:attribute name="data-username"><xsl:value-of select="$user/@id"/></xsl:attribute>
		<xsl:attribute name="data-stamp"><xsl:value-of select="@stamp"/></xsl:attribute>
		<xsl:attribute name="class">
			call-entry
			<xsl:if test="$user/@status = 1"> online</xsl:if>
			<xsl:if test="@inbound = 1 and @duration = 0"> missed</xsl:if>
			<xsl:if test="$user/@id = //Settings/User/@id"> me</xsl:if>
			<xsl:if test="@_new"> anim-entry-prepend</xsl:if>
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
					<xsl:if test="@inbound = 1">
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
</xsl:template>

</xsl:stylesheet>