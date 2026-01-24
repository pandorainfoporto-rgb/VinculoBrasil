// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title VinculoBrasilProperty
 * @dev NFT Contract para Vistorias e Contratos de Aluguel - VinculoBrasil Platform
 *
 * Features:
 * - ERC721 com URI Storage (metadata no IPFS)
 * - Mintable apenas pelo owner (sistema backend)
 * - Burnable (destruir NFT se necessário)
 * - Pausable (emergências)
 * - Contador automático de tokens
 *
 * Cada NFT representa:
 * - Uma vistoria completa (entrada/saída)
 * - Um contrato de aluguel tokenizado
 * - Prova imutável de documentação
 */
contract VinculoBrasilProperty is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    Pausable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Estrutura para armazenar metadados on-chain básicos
    struct PropertyMetadata {
        string propertyAddress;
        string inspectionType; // "ENTRADA" | "SAIDA" | "CONTRATO"
        uint256 timestamp;
        address inspector;
        bool isActive;
    }

    // Mapping de tokenId para metadata on-chain
    mapping(uint256 => PropertyMetadata) public propertyMetadata;

    // Eventos
    event PropertyNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string propertyAddress,
        string inspectionType,
        string ipfsHash
    );

    event PropertyNFTBurned(
        uint256 indexed tokenId,
        address indexed burner
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        string newIpfsHash
    );

    constructor() ERC721("VinculoBrasilProperty", "VBRZ") Ownable(msg.sender) {
        // Token ID começa em 1 (0 é inválido)
        _tokenIdCounter.increment();
    }

    /**
     * @dev Mint um novo NFT de vistoria/contrato
     * @param to Endereço que receberá o NFT (geralmente o locador/proprietário)
     * @param propertyAddress Endereço do imóvel
     * @param inspectionType Tipo de vistoria (ENTRADA/SAIDA/CONTRATO)
     * @param ipfsHash Hash IPFS com todas as fotos e dados da vistoria
     */
    function safeMint(
        address to,
        string memory propertyAddress,
        string memory inspectionType,
        string memory ipfsHash
    ) public onlyOwner whenNotPaused returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint o NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        // Armazenar metadata on-chain
        propertyMetadata[tokenId] = PropertyMetadata({
            propertyAddress: propertyAddress,
            inspectionType: inspectionType,
            timestamp: block.timestamp,
            inspector: msg.sender,
            isActive: true
        });

        emit PropertyNFTMinted(
            tokenId,
            to,
            propertyAddress,
            inspectionType,
            ipfsHash
        );

        return tokenId;
    }

    /**
     * @dev Atualizar URI do token (caso precise corrigir IPFS)
     */
    function updateTokenURI(
        uint256 tokenId,
        string memory newIpfsHash
    ) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newIpfsHash);

        emit MetadataUpdated(tokenId, newIpfsHash);
    }

    /**
     * @dev Marcar NFT como inativo (sem deletar)
     */
    function deactivateNFT(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        propertyMetadata[tokenId].isActive = false;
    }

    /**
     * @dev Pausar o contrato (emergências)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Despausar o contrato
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Retorna o total de NFTs mintados
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    /**
     * @dev Retorna metadata completa de um token
     */
    function getPropertyMetadata(uint256 tokenId)
        public
        view
        returns (PropertyMetadata memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return propertyMetadata[tokenId];
    }

    // Overrides necessários para compatibilidade
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override do burn para emitir evento customizado
     */
    function burn(uint256 tokenId) public override {
        require(_isAuthorized(_ownerOf(tokenId), msg.sender, tokenId), "Not authorized");
        super.burn(tokenId);

        emit PropertyNFTBurned(tokenId, msg.sender);
    }
}
