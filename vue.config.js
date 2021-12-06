module.exports = {

    chainWebpack: config => {
        config.module
            .rule('glslify')
            .test(/\.(glsl|vs|fs|vert|frag)$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
            .use('glslify-loader')
            .loader('glslify-loader')
            .end()

            .rule('file-loader')
            .test(/\.hdr$/)
            .use('file-loader')
            .loader('file-loader')
            .end()
    },

}