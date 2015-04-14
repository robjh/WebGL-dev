
define([], function() {
    
    
    var getExtensions = function(context) {
        var gl = context.getFunctions();
        return gl.getSupportedExtensions();
    };
    var getCompressedTextureFormats = function(context) {
        var gl = context.getFunctions();
        var formats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
        
        var formatSet = [];
        for (var i = 0 ; i < formats.length ; ++i) formatSet.push(formats[i]);
        
        return formatSet;
    };
    
    var CachedValue = function(argv) {
        argv = argv || {};
        
        var m_compute;
        var m_value;
        var m_isComputed;
        
        // argv.compute <class ComputeValue>,
        // argv.defaultValue <template T>
        this._construct = function(argv) {
            if (!argv.compute)      throw new Error('Invalid parameter: argv.compute');
            m_compute    = argv.compute;
            m_value      = argv.defaultValue ? argv.defaultValue : null;
            m_isComputed = false;
        };
        
        // context RenderContext
        this.getValue(context) {
            if (!m_isComputed) {
                m_value = m_computer(context);
                m_isComputed = true;
            }
            return m_value;
        }
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    
    /*--------------------------------------------------------------------*//*!
     * \brief Context information & limit query.
     *//*--------------------------------------------------------------------*/
    var ContextInfo = function(argv) {
        argv = argv || {};
        
        var m_extensions = null;
        var m_compressedTextureFormats = null;
        
        this._construct = function(argv) {
            this.m_context = argv.context; // render context
            m_extensions               = new CachedValue({compute: getExtensions});
            m_compressedTextureFormats = new CachedValue({compute: getCompressedTextureFormats});
        };
        
        this.getParameter = function(param) {
            var ret = this.m_context.getFunctions().getParameter(param);
            if (this.m_context.getFunctions().getError())
                throw new Error('gl.getParameter() failed');
            return ret;
        };
        this.getInt    = this.getParameter;
        this.getBool   = this.getParameter;
        this.getString = this.getParameter;
        
        this.isVertexUniformLoopSupported     = function() { return true; };
        this.isVertexDynamicLoopSupported     = function() { return true; };
        this.isFragmentHighPrecisionSupported = function() { return true; };
        this.isFragmentUniformLoopSupported   = function() { return true; };
        this.isFragmentDynamicLoopSupported   = function() { return true; };
        
        this.isCompressedTextureFormatSupported	= function(format) {
            // The core WebGL specification does not define any supported
            // compressed texture formats.
            var formats = m_compressedTextureFormats.getValue(this.m_context);
            for (var i = 0 ; i < formats.length ; ++i) {
                if (formats[i] == format) return true
            }
            return false;
        };
        
        this.getExtensions = function() {
            return m_extensions.getValue(m_context);
        };
        
        this.isExtensionSupported = function(extName) { // const char*
            var extensions = this.getExtensions();
            for (var i = 0 ; i < extensions.length ; ++i) {
                if (extensions[i] == extName) return true
            }
            return false;
        };
        
        if (!argv.dont_construct) this._construct(argv);
    };
    
    ContextInfo.create = function(context) {
        return new ContextInfo(context)
    };
    
    
    return {
        CachedValue:              CachedValue,
        ExtensionList:            CachedValue, // <std::vector<std::string>, GetExtensions>
        CompressedTextureFormats: CachedValue, // <std::set<int>, GetCompressedTextureFormats>
        ContextInfo:              ContextInfo,
        create:                   ContextInfo.create,
    };
    
});
