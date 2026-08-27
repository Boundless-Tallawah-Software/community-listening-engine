from setuptools import setup, find_packages

setup(
    name='community-listening-engine',
    version='0.1.0',
    packages=find_packages(include=['core', 'api', 'models']),
    install_requires=[
        # List other main dependencies here if needed, but focusing on structure first
    ],
    python_requires='>=3.8',
)
