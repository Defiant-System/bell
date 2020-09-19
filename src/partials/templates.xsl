<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="calls">
	<xsl:for-each select="./*">
		<div class="contact">
			<span class="avatar"></span>
			<div class="details">
				<span class="name">
					<i class="icon-online"></i>
					<xsl:value-of select="@username"/>
				</span>
				<span class="last-call">
					<i class="icon-phone"></i>
					<i class="icon-out"></i>
					<xsl:value-of select="@stamp"/>
				</span>
			</div>
			<div class="actions">
				<i class="icon-info" data-click="get-call-info"></i>
			</div>
		</div>
	</xsl:for-each>
</xsl:template>

</xsl:stylesheet>