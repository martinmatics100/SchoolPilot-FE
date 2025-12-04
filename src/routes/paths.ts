export const rootPaths = {
    homeRoot: '',
    authRoot: '/authentication',
    errorRoot: '/error',
};

const paths = {
    home: `/${rootPaths.homeRoot}`,
    login: `${rootPaths.authRoot}/login`,
    signup: `${rootPaths.authRoot}/signup`,
    notFound: `${rootPaths.errorRoot}/404`,
};

export default paths;